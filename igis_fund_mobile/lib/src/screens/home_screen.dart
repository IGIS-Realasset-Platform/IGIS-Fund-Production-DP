import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import '../data/workspace_catalog.dart';
import '../models/log_visibility.dart';
import '../models/workspace_task.dart';
import '../models/member_profile.dart';
import '../models/work_log.dart';
import '../services/platform_repository.dart';
import 'notification_screen.dart';

const _statusOptions = ['신규', '검토중', '진행중', '보류', '완료'];
const _priorityOptions = ['높음', '중간', '낮음'];
const _triageOptions = ['공유', '협업', '리스크 판단', '의사결정'];

const _projectOptions = [
  _ProjectOption(id: 'IOTA_COMMON', name: 'IOTA 공통'),
  _ProjectOption(id: 'P00030', name: '427 PFV'),
  _ProjectOption(id: 'P00037', name: '816 PFV'),
  _ProjectOption(id: '112614', name: '421 Fund'),
];

class _ProjectOption {
  const _ProjectOption({required this.id, required this.name});

  final String id;
  final String name;
}

String _formatDateTime(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');
  final hour = value.hour.toString().padLeft(2, '0');
  final minute = value.minute.toString().padLeft(2, '0');
  return '$month.$day $hour:$minute';
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final PlatformRepository _repository;
  MemberProfile? _member;
  WorkspaceInfo _selectedWorkspace = workspaceCatalog.first;
  int _selectedIndex = 0;
  int _taskListVersion = 0;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _repository = PlatformRepository(Supabase.instance.client);
    _loadMember();
    _setupPushNotifications();
  }

  Future<void> _setupPushNotifications() async {
    try {
      FirebaseMessaging messaging = FirebaseMessaging.instance;
      // 알림 권한 요청
      NotificationSettings settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        // FCM 토큰 가져오기
        String? token = await messaging.getToken();
        if (token != null) {
          final userId = Supabase.instance.client.auth.currentUser?.id;
          if (userId != null) {
            // DB에 토큰 저장 (Upsert)
            await Supabase.instance.client.from('fcm_tokens').upsert({
              'user_id': userId,
              'fcm_token': token,
              'updated_at': DateTime.now().toIso8601String(),
            });
          }
        }
      }
    } catch (e) {
      debugPrint("Push notification setup error: $e");
    }
  }

  Future<void> _loadMember() async {
    try {
      final member = await _repository.fetchCurrentMember();
      final visibleWorkspaces = visibleWorkspacesForMember(member);
      setState(() {
        _member = member;
        _selectedWorkspace = visibleWorkspaces.isNotEmpty
            ? visibleWorkspaces.first
            : workspaceForMemberOrg(member?.orgName);
        _loading = false;
      });
    } catch (_) {
      setState(() {
        _error = '사용자 정보를 불러오지 못했습니다.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_error != null) {
      return Scaffold(body: Center(child: Text(_error!)));
    }

    final visibleWorkspaces = visibleWorkspacesForMember(_member);
    final pages = [
      WorkspaceTaskList(
        key: ValueKey(_taskListVersion),
        repository: _repository,
        initialWorkspace: _selectedWorkspace,
        workspaces: visibleWorkspaces,
      ),
      WorkspaceFilteredLogList(
        title: '협업게시판',
        repository: _repository,
        member: _member,
        workspaces: visibleWorkspaces,
      ),
      WorkLogList(
        title: '내업무',
        repository: _repository,
        member: _member,
        workspace: null,
        writtenByCurrentMember: true,
        allowWrite: true,
        composerWorkspace: _selectedWorkspace,
        composerWorkspaces: visibleWorkspaces,
        onCreated: () => setState(() => _taskListVersion++),
      ),
      NotificationScreen(repository: _repository),
    ];

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final shouldExit = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('앱 종료'),
            content: const Text('앱을 종료하시겠습니까?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('취소'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('종료'),
              ),
            ],
          ),
        );
        if (shouldExit == true) {
          if (Platform.isAndroid) {
            SystemNavigator.pop();
          }
          exit(0);
        }
      },
      child: Scaffold(
        appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('IOTA Seoul CFT'),
            if (_member != null)
              Text(
                '${_member!.name} · ${_member!.roleCode ?? 'member'}',
                style: Theme.of(context).textTheme.labelSmall,
              ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: '로그아웃',
            onPressed: () async {
              final shouldLogout = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('로그아웃'),
                  content: const Text('로그아웃 하시겠습니까?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('취소'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('로그아웃'),
                    ),
                  ],
                ),
              );
              if (shouldLogout == true) {
                final prefs = await SharedPreferences.getInstance();
                await prefs.setBool('auto_login', false);
                await Supabase.instance.client.auth.signOut();
              }
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: '주요업무',
          ),
          NavigationDestination(
            icon: Icon(Icons.forum_outlined),
            selectedIcon: Icon(Icons.forum),
            label: '협업게시판',
          ),
          NavigationDestination(
            icon: Icon(Icons.list_alt_outlined),
            selectedIcon: Icon(Icons.list_alt),
            label: '내업무',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_outlined),
            selectedIcon: Icon(Icons.notifications),
            label: '알림',
          ),
        ],
      ),
    ));
  }
}

class WorkspaceTaskList extends StatefulWidget {
  const WorkspaceTaskList({
    super.key,
    required this.repository,
    required this.initialWorkspace,
    required this.workspaces,
  });

  final PlatformRepository repository;
  final WorkspaceInfo initialWorkspace;
  final List<WorkspaceInfo> workspaces;

  @override
  State<WorkspaceTaskList> createState() => _WorkspaceTaskListState();
}

class _WorkspaceTaskListState extends State<WorkspaceTaskList> {
  late WorkspaceInfo _workspace;
  late Future<List<WorkspaceTask>> _tasksFuture;
  bool _showIotaOnly = false;

  @override
  void initState() {
    super.initState();
    _workspace = _initialWorkspace();
    _tasksFuture = _fetchTasks();
  }

  @override
  void didUpdateWidget(covariant WorkspaceTaskList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.workspaces.any((workspace) => workspace.code == _workspace.code)) {
      _workspace = _initialWorkspace();
      _tasksFuture = _fetchTasks();
      _showIotaOnly = false;
    }
  }

  bool _isIotaWorkspace() {
    return _workspace.code == 'WS_EMC' || _workspace.code == 'WS_SSC';
  }

  WorkspaceInfo _initialWorkspace() {
    return widget.workspaces.firstWhere(
      (workspace) => workspace.code == widget.initialWorkspace.code,
      orElse: () => widget.workspaces.first,
    );
  }

  Future<List<WorkspaceTask>> _fetchTasks() {
    return widget.repository.fetchWorkspaceTasks(workspace: _workspace);
  }

  Future<void> _refresh() async {
    setState(() => _tasksFuture = _fetchTasks());
  }

  void _changeWorkspace(WorkspaceInfo? workspace) {
    if (workspace == null) {
      return;
    }
    setState(() {
      _workspace = workspace;
      _tasksFuture = _fetchTasks();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.workspaces.isEmpty) {
      return const Center(child: Text('접근 가능한 워크스페이스가 없습니다.'));
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: DropdownButtonFormField<WorkspaceInfo>(
                initialValue: _workspace,
                decoration: const InputDecoration(labelText: '주요업무 워크스페이스'),
                items: widget.workspaces
                    .map(
                      (workspace) => DropdownMenuItem(
                        value: workspace,
                        child: Text(workspace.focusLabel),
                      ),
                    )
                    .toList(),
                onChanged: _changeWorkspace,
              ),
            ),
          ),
          if (_isIotaWorkspace())
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const Text('이오타만 보기', style: TextStyle(fontWeight: FontWeight.bold)),
                    Switch(
                      value: _showIotaOnly,
                      onChanged: (val) => setState(() => _showIotaOnly = val),
                    ),
                  ],
                ),
              ),
            ),
          FutureBuilder<List<WorkspaceTask>>(
            future: _tasksFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              if (snapshot.hasError) {
                return const SliverFillRemaining(
                  child: Center(child: Text('주요 업무현황을 불러오지 못했습니다.')),
                );
              }

              final allTasks = snapshot.data ?? const [];
              final tasks = _showIotaOnly 
                  ? allTasks.where((task) => task.isCoreAsset).toList()
                  : allTasks;

              if (tasks.isEmpty) {
                return SliverFillRemaining(
                  child: Center(
                    child: Text('${_workspace.focusLabel}에 표시할 Task가 없습니다.'),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, childIndex) {
                      if (childIndex.isOdd) {
                        return const SizedBox(height: 10);
                      }
                      final taskIndex = childIndex ~/ 2;
                      return WorkspaceTaskCard(
                        task: tasks[taskIndex],
                        index: taskIndex,
                      );
                    },
                    childCount: tasks.length * 2 - 1,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class WorkspaceTaskCard extends StatelessWidget {
  const WorkspaceTaskCard({super.key, required this.task, required this.index});

  final WorkspaceTask task;
  final int index;

  String _formatDueDate() {
    final dueDate = task.dueDate;
    if (dueDate == null) {
      return '마감일 없음';
    }
    return '${dueDate.year}.${dueDate.month.toString().padLeft(2, '0')}.${dueDate.day.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('Task ${index + 1}', style: theme.textTheme.labelMedium),
                const Spacer(),
                Text(
                  '목표 마감일 ${_formatDueDate()}',
                  style: theme.textTheme.labelSmall,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              task.taskName.isEmpty ? 'Task 명 없음' : task.taskName,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.titleMedium?.copyWith(
                color: const Color(0xFFFFC928),
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '다음액션 ${task.nextAction.trim().isEmpty ? '작성된 내용이 없습니다.' : task.nextAction}',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF8E8E93),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class WorkspaceFilteredLogList extends StatefulWidget {
  const WorkspaceFilteredLogList({
    super.key,
    required this.title,
    required this.repository,
    required this.member,
    required this.workspaces,
    this.triageTypes = const {},
    this.importantOnly = false,
  });

  final String title;
  final PlatformRepository repository;
  final MemberProfile? member;
  final List<WorkspaceInfo> workspaces;
  final Set<String> triageTypes;
  final bool importantOnly;

  @override
  State<WorkspaceFilteredLogList> createState() =>
      _WorkspaceFilteredLogListState();
}

class _WorkspaceFilteredLogListState extends State<WorkspaceFilteredLogList> {
  WorkspaceInfo? _workspace;

  @override
  void initState() {
    super.initState();
    _workspace = widget.workspaces.isEmpty ? null : widget.workspaces.first;
  }

  @override
  void didUpdateWidget(covariant WorkspaceFilteredLogList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.workspaces.contains(_workspace)) {
      _workspace = widget.workspaces.isEmpty ? null : widget.workspaces.first;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.workspaces.isEmpty || _workspace == null) {
      return const Center(child: Text('접근 가능한 워크스페이스가 없습니다.'));
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
          child: DropdownButtonFormField<WorkspaceInfo>(
            initialValue: _workspace,
            decoration: InputDecoration(labelText: '${widget.title} 워크스페이스'),
            items: widget.workspaces
                .map(
                  (workspace) => DropdownMenuItem(
                    value: workspace,
                    child: Text(workspace.label),
                  ),
                )
                .toList(),
            onChanged: (workspace) => setState(() => _workspace = workspace),
          ),
        ),
        Expanded(
          child: WorkLogList(
            title: '${widget.title} · ${_workspace!.label}',
            repository: widget.repository,
            member: widget.member,
            workspace: _workspace,
            triageTypes: widget.triageTypes,
            importantOnly: widget.importantOnly,
          ),
        ),
      ],
    );
  }
}

class WorkLogList extends StatefulWidget {
  const WorkLogList({
    super.key,
    required this.title,
    required this.repository,
    required this.member,
    this.workspace,
    this.triageTypes = const {},
    this.importantOnly = false,
    this.writtenByCurrentMember = false,
    this.allowWrite = false,
    this.composerWorkspace,
    this.composerWorkspaces = const [],
    this.onCreated,
  });

  final String title;
  final PlatformRepository repository;
  final MemberProfile? member;
  final WorkspaceInfo? workspace;
  final Set<String> triageTypes;
  final bool importantOnly;
  final bool writtenByCurrentMember;
  final bool allowWrite;
  final WorkspaceInfo? composerWorkspace;
  final List<WorkspaceInfo> composerWorkspaces;
  final VoidCallback? onCreated;

  @override
  State<WorkLogList> createState() => _WorkLogListState();
}

class _WorkLogListState extends State<WorkLogList> {
  late Future<List<WorkLog>> _logsFuture;

  @override
  void initState() {
    super.initState();
    _logsFuture = _fetchLogs();
  }

  @override
  void didUpdateWidget(covariant WorkLogList oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.workspace?.code != widget.workspace?.code ||
        oldWidget.importantOnly != widget.importantOnly ||
        oldWidget.writtenByCurrentMember != widget.writtenByCurrentMember ||
        oldWidget.triageTypes.join('|') != widget.triageTypes.join('|')) {
      _logsFuture = _fetchLogs();
    }
  }

  Future<List<WorkLog>> _fetchLogs() async {
    return widget.repository.fetchRecentLogs(
      member: widget.member,
      workspace: widget.workspace,
      triageTypes: widget.triageTypes,
      importantOnly: widget.importantOnly,
      writtenByCurrentMember: widget.writtenByCurrentMember,
    );
  }

  void _refresh() {
    setState(() => _logsFuture = _fetchLogs());
  }

  Future<void> _openComposer() async {
    final composerWorkspace = widget.composerWorkspace ?? widget.workspace;
    final composerWorkspaces = widget.composerWorkspaces.isNotEmpty
        ? widget.composerWorkspaces
        : [?composerWorkspace];
    if (widget.member == null || composerWorkspaces.isEmpty) {
      return;
    }
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) => LogComposerSheet(
        repository: widget.repository,
        member: widget.member!,
        workspace: composerWorkspace,
        workspaces: composerWorkspaces,
      ),
    );
    if (created == true) {
      _refresh();
      widget.onCreated?.call();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: widget.allowWrite
          ? FloatingActionButton.extended(
              onPressed: _openComposer,
              icon: const Icon(Icons.add),
              label: const Text('작성'),
            )
          : null,
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => _refresh(),
              child: FutureBuilder<List<WorkLog>>(
                future: _logsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.hasError) {
                    return ListView(
                      padding: const EdgeInsets.all(24),
                      children: const [Text('업무 로그를 불러오지 못했습니다.')],
                    );
                  }
                  final logs = snapshot.data ?? const [];
            
                  if (logs.isEmpty) {
                    return ListView(
                      padding: const EdgeInsets.all(24),
                      children: [
                        Text('${widget.title}에 표시할 로그가 없습니다.'),
                        const SizedBox(height: 16),
                        const Text('더 오래된 내역은 PC 웹 플랫폼에서 확인하실 수 있습니다.', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    );
                  }
            
                  return ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                    itemBuilder: (context, index) {
                      if (index == logs.length) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(
                            child: Text(
                              '더 오래된 내역은 PC 웹 플랫폼에서 확인하실 수 있습니다.',
                              style: TextStyle(color: Colors.grey, fontSize: 13),
                            ),
                          ),
                        );
                      }
                      final log = logs[index];
                      return WorkLogCard(
                        log: log,
                        member: widget.member,
                        repository: widget.repository,
                        onChanged: _refresh,
                      );
                    },
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemCount: logs.length + 1,
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class WorkLogCard extends StatelessWidget {
  const WorkLogCard({
    super.key,
    required this.log,
    required this.member,
    required this.repository,
    required this.onChanged,
  });

  final WorkLog log;
  final MemberProfile? member;
  final PlatformRepository repository;
  final VoidCallback onChanged;

  Future<void> _openDetail(BuildContext context) async {
    final changed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (context) =>
          LogDetailSheet(log: log, member: member, repository: repository),
    );

    if (changed == true) {
      onChanged();
    }
  }

  @override
  Widget build(BuildContext context) {
    final canRead = member != null && log.isVisibleTo(member!);

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () {
          if (canRead) {
            _openDetail(context);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('내용 열람 권한이 없습니다.')),
            );
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      log.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    log.priority,
                    style: const TextStyle(
                      color: Color(0xFF1F6FEB),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (canRead)
                Text(
                  log.rawText,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(height: 1.4),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: const [
                      Icon(Icons.lock_outline, size: 16, color: Colors.grey),
                      SizedBox(width: 6),
                      Text(
                        '내용 열람 권한이 없습니다.',
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  _MetaChip(label: log.workspaceLabel, category: _ChipCategory.workspace),
                  _MetaChip(label: log.projectName, category: _ChipCategory.project),
                  _MetaChip(label: log.triageType, category: _ChipCategory.triage),
                  _MetaChip(label: log.visibilityLabel, category: _ChipCategory.visibility),
                  if (log.stakeholderRoleCategory.isNotEmpty)
                    _MetaChip(label: log.stakeholderRoleCategory, category: _ChipCategory.stakeholder),
                  if (log.stakeholderName.isNotEmpty)
                    _MetaChip(label: log.stakeholderName.split(' - ').first, category: _ChipCategory.person),
                  _MetaChip(label: log.status, category: _ChipCategory.status),
                  _MetaChip(label: log.writerName, category: _ChipCategory.person),
                  _MetaChip(label: '댓글 ${log.comments.length}', category: _ChipCategory.comment),
                ],
              ),
              if (canRead && log.commentItems.isNotEmpty) ...[
                const SizedBox(height: 12),
                _CommentPreview(comment: log.commentItems.last),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class LogDetailSheet extends StatefulWidget {
  const LogDetailSheet({
    super.key,
    required this.log,
    required this.member,
    required this.repository,
  });

  final WorkLog log;
  final MemberProfile? member;
  final PlatformRepository repository;

  @override
  State<LogDetailSheet> createState() => _LogDetailSheetState();
}

class _LogDetailSheetState extends State<LogDetailSheet> {
  final _commentController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitComment() async {
    final member = widget.member;
    final text = _commentController.text.trim();
    if (member == null || text.isEmpty) {
      return;
    }

    setState(() => _submitting = true);
    try {
      await widget.repository.addComment(
        log: widget.log,
        member: member,
        text: text,
      );
      if (mounted) {
        Navigator.pop(context, true);
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;
    final comments = widget.log.commentItems;

    return FractionallySizedBox(
      heightFactor: 0.9,
      child: Material(
        color: const Color(0xFF171717),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, bottom + 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.log.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: '닫기',
                    onPressed: () => Navigator.pop(context, false),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  _MetaChip(label: widget.log.workspaceLabel, category: _ChipCategory.workspace),
                  _MetaChip(label: widget.log.projectName, category: _ChipCategory.project),
                  _MetaChip(label: widget.log.triageType, category: _ChipCategory.triage),
                  _MetaChip(label: widget.log.visibilityLabel, category: _ChipCategory.visibility),
                  _MetaChip(label: widget.log.status, category: _ChipCategory.status),
                  _MetaChip(label: widget.log.priority, category: _ChipCategory.priority),
                  _MetaChip(label: widget.log.writerName, category: _ChipCategory.person),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  children: [
                    Text(
                      widget.log.rawText,
                      style: const TextStyle(fontSize: 15, height: 1.55),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      '댓글 ${comments.length}',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (comments.isEmpty)
                      const Text(
                        '아직 댓글이 없습니다.',
                        style: TextStyle(color: Color(0xFFA1A1AA)),
                      )
                    else
                      ...comments.map((comment) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _CommentTile(comment: comment),
                        );
                      }),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _commentController,
                minLines: 2,
                maxLines: 4,
                enabled: widget.member != null && !_submitting,
                decoration: const InputDecoration(
                  labelText: '댓글',
                  hintText: '댓글 내용을 입력하세요.',
                ),
              ),
              const SizedBox(height: 10),
              FilledButton.icon(
                onPressed: widget.member == null || _submitting
                    ? null
                    : _submitComment,
                icon: _submitting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.send),
                label: Text(_submitting ? '등록 중' : '댓글 등록'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CommentPreview extends StatelessWidget {
  const _CommentPreview({required this.comment});

  final LogComment comment;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1F1F1F),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Text(
        '${comment.author}: ${comment.text}',
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(color: Color(0xFFCFCFCF), height: 1.35),
      ),
    );
  }
}

class _CommentTile extends StatelessWidget {
  const _CommentTile({required this.comment});

  final LogComment comment;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF222222),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF333333)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  comment.author,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
              if (comment.createdAt != null)
                Text(
                  _formatDateTime(comment.createdAt!),
                  style: const TextStyle(
                    color: Color(0xFF86868B),
                    fontSize: 12,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(comment.text, style: const TextStyle(height: 1.45)),
        ],
      ),
    );
  }
}

enum _ChipCategory {
  workspace,   // 워크스페이스
  project,     // 프로젝트
  triage,      // 유형 (공유/협업/의사결정/리스크)
  visibility,  // 공개 범위
  stakeholder, // 이해관계자 역할
  person,      // 사람 이름
  status,      // 상태
  comment,     // 댓글
  priority,    // 우선순위
  general,     // 기타
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({
    required this.label,
    this.category = _ChipCategory.general,
  });

  final String label;
  final _ChipCategory category;

  static const _categoryStyles = <_ChipCategory, _ChipStyle>{
    _ChipCategory.workspace:   _ChipStyle(Color(0xFF1A3A5C), Color(0xFF5BA8F5), Icons.workspaces_outlined),
    _ChipCategory.project:     _ChipStyle(Color(0xFF2D1B4E), Color(0xFFB68AE8), Icons.folder_outlined),
    _ChipCategory.triage:      _ChipStyle(Color(0xFF1B3D2F), Color(0xFF5EC090), Icons.label_outlined),
    _ChipCategory.visibility:  _ChipStyle(Color(0xFF3D351B), Color(0xFFE0C060), Icons.visibility_outlined),
    _ChipCategory.stakeholder: _ChipStyle(Color(0xFF3D1B2A), Color(0xFFE07090), Icons.business_outlined),
    _ChipCategory.person:      _ChipStyle(Color(0xFF1B2F3D), Color(0xFF70B8E0), Icons.person_outlined),
    _ChipCategory.status:      _ChipStyle(Color(0xFF2A3D1B), Color(0xFFA0D060), Icons.circle_outlined),
    _ChipCategory.comment:     _ChipStyle(Color(0xFF333333), Color(0xFFA1A1AA), Icons.chat_bubble_outline),
    _ChipCategory.priority:    _ChipStyle(Color(0xFF3D2A1B), Color(0xFFE0A060), Icons.flag_outlined),
    _ChipCategory.general:     _ChipStyle(Color(0xFF1F1F1F), Color(0xFFA1A1AA), null),
  };

  @override
  Widget build(BuildContext context) {
    final style = _categoryStyles[category] ?? _categoryStyles[_ChipCategory.general]!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: style.bgColor.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: style.fgColor.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (style.icon != null) ...[
            Icon(style.icon, size: 12, color: style.fgColor.withValues(alpha: 0.7)),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(fontSize: 11, color: style.fgColor, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _ChipStyle {
  const _ChipStyle(this.bgColor, this.fgColor, this.icon);
  final Color bgColor;
  final Color fgColor;
  final IconData? icon;
}

enum _ComposerMode { task, collaboration }

class LogComposerSheet extends StatefulWidget {
  const LogComposerSheet({
    super.key,
    required this.repository,
    required this.member,
    required this.workspace,
    required this.workspaces,
  });

  final PlatformRepository repository;
  final MemberProfile member;
  final WorkspaceInfo? workspace;
  final List<WorkspaceInfo> workspaces;

  @override
  State<LogComposerSheet> createState() => _LogComposerSheetState();
}

class _LogComposerSheetState extends State<LogComposerSheet> {
  final _logController = TextEditingController();
  final _taskNameController = TextEditingController();
  final _companyNameController = TextEditingController();
  final _relatedAssetController = TextEditingController(text: 'IOTA 공통');
  final _nextActionController = TextEditingController();

  _ComposerMode _composerMode = _ComposerMode.task;
  _ProjectOption _project = _projectOptions.first;
  late WorkspaceInfo _selectedWorkspace;
  String _triageType = '공유';
  String _logStatus = '검토중';
  String _taskStatus = '아이데이션';
  String _priority = '중간';
  DateTime? _dueDate;
  final Set<String> _sharedWorkspaceCodes = <String>{};
  final Set<String> _selectedUserEmails = <String>{};
  late final Future<List<MemberProfile>> _membersFuture;
  bool _submitting = false;

  static const _taskStatusOptions = ['아이데이션', '검토중', '진행중', '보류', '완료'];

  List<WorkspaceInfo> get _availableWorkspaces {
    if (widget.workspaces.isNotEmpty) {
      return widget.workspaces;
    }
    if (widget.workspace != null) {
      return [widget.workspace!];
    }
    return visibleWorkspacesForMember(widget.member);
  }

  WorkspaceInfo get _taskWorkspace {
    return _availableWorkspaces.firstWhere(
      (workspace) => workspace.matchesOrg(widget.member.orgName),
      orElse: () => _selectedWorkspace,
    );
  }

  List<WorkspaceInfo> get _sharedWorkspaces {
    final codes = {
      _selectedWorkspace.code,
      ..._sharedWorkspaceCodes,
    };
    return _availableWorkspaces
        .where((workspace) => codes.contains(workspace.code))
        .toList();
  }

  @override
  void initState() {
    super.initState();
    final workspaces = _availableWorkspaces;
    _selectedWorkspace = workspaces.firstWhere(
      (workspace) => workspace.code == widget.workspace?.code,
      orElse: () => workspaces.first,
    );
    _sharedWorkspaceCodes.add(_selectedWorkspace.code);
    _membersFuture = widget.repository.fetchPilotMembers();
    _logController.addListener(_handleInputChanged);
    _taskNameController.addListener(_handleInputChanged);
  }

  @override
  void dispose() {
    _logController.dispose();
    _taskNameController.dispose();
    _companyNameController.dispose();
    _relatedAssetController.dispose();
    _nextActionController.dispose();
    super.dispose();
  }

  void _handleInputChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  LogVisibilitySetting _buildVisibilitySetting() {
    final groups = <String>{};
    for (final workspace in _sharedWorkspaces) {
      groups.addAll(workspace.visibilityGroups);
    }
    
    return LogVisibilitySetting.restricted(
      groups: groups.toList(),
      individuals: _selectedUserEmails.toList(),
    );
  }

  bool get _canSubmit {
    if (_submitting) {
      return false;
    }
    switch (_composerMode) {
      case _ComposerMode.task:
        return _taskNameController.text.trim().isNotEmpty;
      case _ComposerMode.collaboration:
        return _logController.text.trim().isNotEmpty;
    }
  }

  String get _submitFailureMessage {
    switch (_composerMode) {
      case _ComposerMode.task:
        return 'Task를 저장하지 못했습니다.';
      case _ComposerMode.collaboration:
        return '로그를 저장하지 못했습니다.';
    }
  }

  Future<void> _submit() async {
    if (_composerMode == _ComposerMode.task) {
      await _submitTask();
    } else {
      await _submitLog();
    }
  }

  Future<void> _submitTask() async {
    final taskName = _taskNameController.text.trim();
    if (taskName.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('업무명을 입력해야 합니다.')));
      return;
    }

    setState(() => _submitting = true);
    try {
      await widget.repository.createTask(
        member: widget.member,
        workspace: _taskWorkspace,
        taskName: taskName,
        companyName: _companyNameController.text.trim(),
        relatedAsset: _relatedAssetController.text.trim().isEmpty
            ? 'IOTA 공통'
            : _relatedAssetController.text.trim(),
        status: _taskStatus,
        priority: _priority,
        dueDate: _dueDate,
        nextAction: _nextActionController.text.trim(),
      );
      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(_submitFailureMessage)));
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  Future<void> _submitLog() async {
    final content = _logController.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('작성할 내용을 입력해야 합니다.')));
      return;
    }
    if (_sharedWorkspaceCodes.isEmpty && _selectedUserEmails.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('조회 범위를 1개 이상 선택해야 합니다.')));
      return;
    }

    setState(() => _submitting = true);
    try {
      await widget.repository.createLog(
        member: widget.member,
        workspace: _selectedWorkspace,
        content: content,
        triageType: _triageType,
        status: _logStatus,
        priority: _priority,
        visibility: _buildVisibilitySetting(),
        projectId: _project.id,
        projectName: _project.name,
      );
      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(_submitFailureMessage)));
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  Widget _buildSection({required String title, required Widget child}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Color(0xFFA1A1AA),
            fontSize: 13,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }

  Widget _buildStringChoices({
    required List<String> options,
    required String selected,
    required ValueChanged<String> onSelected,
  }) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.map((option) {
        return ChoiceChip(
          label: Text(option),
          selected: option == selected,
          onSelected: (_) => setState(() => onSelected(option)),
        );
      }).toList(),
    );
  }

  Widget _buildProjectChoices() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _projectOptions.map((project) {
        return ChoiceChip(
          label: Text(project.name),
          selected: project.id == _project.id,
          onSelected: (_) => setState(() => _project = project),
        );
      }).toList(),
    );
  }

  Widget _buildWorkspaceSelector({required String label}) {
    final workspaces = _availableWorkspaces;
    final selected = workspaces.any(
      (workspace) => workspace.code == _selectedWorkspace.code,
    )
        ? _selectedWorkspace
        : workspaces.first;

    return DropdownButtonFormField<WorkspaceInfo>(
      initialValue: selected,
      decoration: InputDecoration(labelText: label),
      items: workspaces
          .map(
            (workspace) => DropdownMenuItem(
              value: workspace,
              child: Text(workspace.focusLabel),
            ),
          )
          .toList(),
      onChanged: (value) {
        if (value == null) {
          return;
        }
        setState(() {
          _selectedWorkspace = value;
          _sharedWorkspaceCodes.add(value.code);
        });
      },
    );
  }

  Widget _buildComposerModeSelector() {
    return SegmentedButton<_ComposerMode>(
      segments: const [
        ButtonSegment(
          value: _ComposerMode.task,
          icon: Icon(Icons.playlist_add_check),
          label: Text('Task 등록'),
        ),
        ButtonSegment(
          value: _ComposerMode.collaboration,
          icon: Icon(Icons.edit_note),
          label: Text('협업 글작성'),
        ),
      ],
      selected: {_composerMode},
      onSelectionChanged: (selection) {
        setState(() => _composerMode = selection.first);
      },
    );
  }

  String _formatDueDate(DateTime? date) {
    if (date == null) {
      return '선택 안 함';
    }
    final month = date.month.toString().padLeft(2, '0');
    final day = date.day.toString().padLeft(2, '0');
    return '${date.year}-$month-$day';
  }

  Future<void> _pickDueDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 5),
    );
    if (picked != null) {
      setState(() => _dueDate = picked);
    }
  }

  Widget _buildTaskForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSection(
          title: 'Task 등록 워크스페이스',
          child: InputDecorator(
            decoration: const InputDecoration(),
            child: Text(_taskWorkspace.focusLabel),
          ),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: _taskNameController,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(
            labelText: '업무명',
            hintText: '등록할 Task를 입력하세요.',
          ),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: _companyNameController,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(
            labelText: '회사명',
            hintText: '비워두면 내부업무로 표시됩니다.',
          ),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: _relatedAssetController,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(labelText: '관련자산'),
        ),
        const SizedBox(height: 18),
        _buildSection(
          title: '상태',
          child: _buildStringChoices(
            options: _taskStatusOptions,
            selected: _taskStatus,
            onSelected: (value) => _taskStatus = value,
          ),
        ),
        const SizedBox(height: 18),
        _buildSection(
          title: '우선순위',
          child: _buildStringChoices(
            options: _priorityOptions,
            selected: _priority,
            onSelected: (value) => _priority = value,
          ),
        ),
        const SizedBox(height: 18),
        OutlinedButton.icon(
          onPressed: _pickDueDate,
          icon: const Icon(Icons.event),
          label: Text('D-Day: ${_formatDueDate(_dueDate)}'),
        ),
        const SizedBox(height: 18),
        TextField(
          controller: _nextActionController,
          minLines: 2,
          maxLines: 4,
          decoration: const InputDecoration(
            labelText: 'Next Action',
            alignLabelWithHint: true,
          ),
        ),
      ],
    );
  }

  Widget _buildCollaborationForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildWorkspaceSelector(label: '협업 글작성 워크스페이스'),
        const SizedBox(height: 18),
        TextField(
          controller: _logController,
          minLines: 6,
          maxLines: 10,
          decoration: const InputDecoration(
            labelText: '내용',
            hintText: '협업게시판에 등록할 내용을 입력하세요.',
            alignLabelWithHint: true,
          ),
        ),
        const SizedBox(height: 18),
        _buildSection(
          title: '프로젝트',
          child: _buildProjectChoices(),
        ),
        const SizedBox(height: 18),
        _buildSection(
          title: '목적',
          child: _buildStringChoices(
            options: _triageOptions,
            selected: _triageType,
            onSelected: (value) => _triageType = value,
          ),
        ),
        const SizedBox(height: 18),
        _buildSection(
          title: '상태',
          child: _buildStringChoices(
            options: _statusOptions,
            selected: _logStatus,
            onSelected: (value) => _logStatus = value,
          ),
        ),
        const SizedBox(height: 18),
        _buildSection(
          title: '중요도',
          child: _buildStringChoices(
            options: _priorityOptions,
            selected: _priority,
            onSelected: (value) => _priority = value,
          ),
        ),
        const SizedBox(height: 18),
        _buildSection(
          title: '조회 범위',
          child: _buildVisibilityControls(),
        ),
      ],
    );
  }

  Widget _buildVisibilityControls() {
    return FutureBuilder<List<MemberProfile>>(
      future: _membersFuture,
      builder: (context, snapshot) {
        final members = snapshot.data ?? const <MemberProfile>[];
        final selectedMembers = members
            .where(
              (member) => _selectedUserEmails.contains(member.normalizedEmail),
            )
            .toList();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              '공유 워크스페이스',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFFA1A1AA),
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 8),
            Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _availableWorkspaces.map((workspace) {
                  final isPrimary = workspace.code == _selectedWorkspace.code;
                  final selected =
                      isPrimary || _sharedWorkspaceCodes.contains(workspace.code);
                  return FilterChip(
                    label: Text(workspace.focusLabel),
                    selected: selected,
                    onSelected: isPrimary
                        ? null
                        : (value) {
                            setState(() {
                              if (value) {
                                _sharedWorkspaceCodes.add(workspace.code);
                              } else {
                                _sharedWorkspaceCodes.remove(workspace.code);
                              }
                            });
                          },
                  );
                }).toList(),
              ),
            const SizedBox(height: 24),
            Text(
              '조회 인원 추가',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFFA1A1AA),
                    fontWeight: FontWeight.w700,
                  ),
            ),
            const SizedBox(height: 8),
            Autocomplete<MemberProfile>(
                displayStringForOption: (member) => member.name,
                optionsBuilder: (textEditingValue) {
                  final query = textEditingValue.text.trim().toLowerCase();
                  if (query.isEmpty) {
                    return const Iterable<MemberProfile>.empty();
                  }
                  return members.where((member) {
                    if (_selectedUserEmails.contains(member.normalizedEmail)) {
                      return false;
                    }
                    return member.name.toLowerCase().contains(query) ||
                        member.email.toLowerCase().contains(query) ||
                        (member.orgName ?? '').toLowerCase().contains(query);
                  });
                },
                fieldViewBuilder: (
                  context,
                  controller,
                  focusNode,
                  onFieldSubmitted,
                ) {
                  return TextField(
                    controller: controller,
                    focusNode: focusNode,
                    decoration: const InputDecoration(
                      labelText: '인원 검색',
                      hintText: '이름, 이메일, 조직명으로 검색',
                    ),
                  );
                },
                onSelected: (member) {
                  setState(
                    () => _selectedUserEmails.add(member.normalizedEmail),
                  );
                },
              ),
              if (selectedMembers.isNotEmpty) ...[
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: selectedMembers.map((member) {
                    return Chip(
                      label: Text(member.name),
                      onDeleted: () {
                        setState(
                          () => _selectedUserEmails.remove(
                            member.normalizedEmail,
                          ),
                        );
                      },
                    );
                  }).toList(),
                ),
              ],
              if (snapshot.connectionState == ConnectionState.waiting) ...[
                const SizedBox(height: 8),
                const LinearProgressIndicator(),
              ],
            const SizedBox(height: 12),
            Text(
              '관리자 및 부문대표는 항상 조회할 수 있습니다.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: const Color(0xFFA1A1AA),
                  ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildForm() {
    switch (_composerMode) {
      case _ComposerMode.task:
        return _buildTaskForm();
      case _ComposerMode.collaboration:
        return _buildCollaborationForm();
    }
  }

  @override
  Widget build(BuildContext context) {
    final mq = MediaQuery.of(context);
    final bottomPadding = mq.viewInsets.bottom > 0 ? mq.viewInsets.bottom : mq.padding.bottom;

    return Material(
      color: Colors.transparent,
      child: Container(
        height: mq.size.height * 0.9,
        decoration: const BoxDecoration(
          color: Color(0xFF171717),
          borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
        ),
        child: Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, bottomPadding + 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      '작성',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: '닫기',
                    onPressed: () => Navigator.pop(context, false),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              _buildComposerModeSelector(),
              const SizedBox(height: 16),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.only(top: 8, bottom: 8),
                  child: _buildForm(),
                ),
              ),
              const SizedBox(height: 12),
              FilledButton.icon(
                onPressed: _canSubmit ? _submit : null,
                icon: _submitting
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.check),
                label: Text(_submitting ? '저장 중' : '저장'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
