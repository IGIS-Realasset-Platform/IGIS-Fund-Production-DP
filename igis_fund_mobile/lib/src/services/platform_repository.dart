import 'package:supabase_flutter/supabase_flutter.dart';

import '../data/workspace_catalog.dart';
import '../models/log_visibility.dart';
import '../models/workspace_task.dart';
import '../models/member_profile.dart';
import '../models/work_log.dart';
import '../models/iota_notification.dart';

class PlatformRepository {
  PlatformRepository(this._client);

  final SupabaseClient _client;

  Future<MemberProfile?> fetchCurrentMember() async {
    final email = _client.auth.currentUser?.email;
    if (email == null) {
      return null;
    }

    final data = await _client
        .from('iota_seoul_pilot_members')
        .select()
        .eq('email', email)
        .maybeSingle();

    if (data == null) {
      return MemberProfile(email: email, name: email);
    }

    return MemberProfile.fromMap(data);
  }

  Future<List<MemberProfile>> fetchPilotMembers() async {
    final data = await _client
        .from('iota_seoul_pilot_members')
        .select('email, staff_name, org_name, role_code')
        .order('staff_name');

    return data.map<MemberProfile>(MemberProfile.fromMap).toList();
  }

  Future<List<WorkLog>> fetchRecentLogs({
    required MemberProfile? member,
    WorkspaceInfo? workspace,
    Set<String> triageTypes = const {},
    bool importantOnly = false,
    bool writtenByCurrentMember = false,
    int limit = 30,
  }) async {
    var query = _client
        .from('iota_seoul_logs')
        .select('*, iota_seoul_log_stakeholders(sh_name, role_category)');
    final workspaces = visibleWorkspacesForMember(member);

    if (member == null || workspaces.isEmpty) {
      return const [];
    }

    if (workspace != null) {
      final canReadWorkspace = workspaces.any(
        (visibleWorkspace) => visibleWorkspace.code == workspace.code,
      );
      if (!canReadWorkspace) {
        return const [];
      }
      // DB 필터링을 제거하고, 아래 Dart 영역에서 필터링하여 '각 워크스페이스'와 같은 전역 로그가 누락되지 않도록 함
    }

    final queryLimit = workspace == null ? 2000 : 2000;
    final data = await query
        .order('work_date', ascending: false)
        .order('created_at', ascending: false)
        .limit(queryLimit);
    return data
        .map<WorkLog>((item) => WorkLog.fromMap(item))
        .where((log) {
          if (workspace != null) {
            final belongs = log.workspaceCode == workspace.code ||
                log.workspaceLabel == workspace.label ||
                workspace.matchesOrg(log.workspaceLabel) ||
                workspace.matchesOrg(log.cellName);
            if (!belongs) {
              return false;
            }
          }
          if (writtenByCurrentMember &&
              log.writerStaffId.trim().toLowerCase() !=
                  member.normalizedEmail) {
            return false;
          }
          if (triageTypes.isNotEmpty && !triageTypes.contains(log.triageType)) {
            return false;
          }
          if (importantOnly && !log.isMajorWork) {
            return false;
          }
          return true;
        })
        .take(limit)
        .toList();
  }

  Future<List<WorkspaceTask>> fetchWorkspaceTasks({
    required WorkspaceInfo workspace,
    int limit = 50,
  }) async {
    final data = await _client
        .from(workspace.taskTable)
        .select('*')
        // The web platform reorders task priority by rewriting created_at.
        .order('created_at', ascending: false)
        .limit(limit);

    return data.map<WorkspaceTask>((item) => WorkspaceTask.fromMap(item)).toList();
  }

  Future<void> createTask({
    required MemberProfile member,
    required WorkspaceInfo workspace,
    required String taskName,
    String companyName = '',
    String relatedAsset = 'IOTA 공통',
    String status = '아이데이션',
    String priority = '중간',
    DateTime? dueDate,
    String nextAction = '',
  }) async {
    final canWriteWorkspace = visibleWorkspacesForMember(
      member,
    ).any((visibleWorkspace) => visibleWorkspace.code == workspace.code);
    if (!canWriteWorkspace) {
      throw StateError('No write access for this workspace.');
    }

    final payload = <String, dynamic>{
      'task_name': taskName.trim(),
      'related_asset': relatedAsset.trim().isEmpty
          ? 'IOTA 공통'
          : relatedAsset.trim(),
      'status': status,
      'priority': priority,
      'due_date': dueDate?.toIso8601String().substring(0, 10),
      'next_action': nextAction.trim(),
      'created_at': DateTime.now().toIso8601String(),
    };
    if (workspace.taskTable != 'iota_digital_tasks') {
      payload['company_name'] = companyName.trim();
    }

    await _client.from(workspace.taskTable).insert(payload);
  }

  bool _canReadLog(
    MemberProfile member,
    List<WorkspaceInfo> workspaces,
    WorkLog log,
  ) {
    final inWorkspace = workspaces.any((workspace) {
      return workspace.code == log.workspaceCode ||
          workspace.label == log.workspaceLabel ||
          workspace.matchesOrg(log.workspaceLabel) ||
          workspace.matchesOrg(log.cellName);
    });
    if (!log.hasExplicitVisibility) {
      return inWorkspace;
    }
    return log.isVisibleTo(member);
  }

  Future<void> createLog({
    required MemberProfile member,
    required WorkspaceInfo workspace,
    required String content,
    required String triageType,
    required String status,
    required String priority,
    required LogVisibilitySetting visibility,
    String projectId = 'IOTA_COMMON',
    String projectName = 'IOTA 공통',
    String? stakeholderName,
    String? stakeholderRoleCategory,
  }) async {
    final canWriteWorkspace = visibleWorkspacesForMember(
      member,
    ).any((visibleWorkspace) => visibleWorkspace.code == workspace.code);
    if (!canWriteWorkspace) {
      throw StateError('No write access for this workspace.');
    }

    final now = DateTime.now();
    final logId = 'iota_issue_${now.millisecondsSinceEpoch}';

    await _client.from('iota_seoul_logs').insert({
      'log_id': logId,
      'writer_staff_id': member.email,
      'writer_name': member.name,
      'work_date': now.toIso8601String().substring(0, 10),
      'raw_text': content,
      'summary': content.length > 160 ? content.substring(0, 160) : content,
      'input_status': 'submitted',
      'source_system': 'mobile_app',
      'metadata': {
        'workspace_code': workspace.code,
        'workspace_label': workspace.label,
        'project_name': projectName,
        'triage_type': triageType,
        'issue_status': status,
        'priority': priority,
        'comments': <Map<String, dynamic>>[],
        ...visibility.toMetadata(),
      },
    });

    await _client.from('iota_seoul_log_links').insert({
      'link_id': 'link_$logId',
      'log_id': logId,
      'proj_id': projectId,
      'relation_type': 'direct_input',
    });

    final trimmedStakeholderName = stakeholderName?.trim() ?? '';
    final trimmedStakeholderRole = stakeholderRoleCategory?.trim() ?? '';
    if (trimmedStakeholderName.isNotEmpty ||
        trimmedStakeholderRole.isNotEmpty) {
      await _client.from('iota_seoul_log_stakeholders').insert({
        'sh_id': 'sh_$logId',
        'log_id': logId,
        'sh_name': trimmedStakeholderName.isEmpty
            ? null
            : trimmedStakeholderName,
        'role_category': trimmedStakeholderRole.isEmpty
            ? null
            : trimmedStakeholderRole,
      });
    }
  }

  Future<void> addComment({
    required WorkLog log,
    required MemberProfile member,
    required String text,
  }) async {
    final comments = List<Map<String, dynamic>>.from(log.comments);
    comments.add({
      'id': 'comment_${DateTime.now().millisecondsSinceEpoch}',
      'author': member.name,
      'author_email': member.email,
      'text': text,
      'created_at': DateTime.now().toIso8601String(),
    });

    final metadata = Map<String, dynamic>.from(log.metadata);
    metadata['comments'] = comments;

    await _client
        .from('iota_seoul_logs')
        .update({'metadata': metadata})
        .eq('log_id', log.id);
  }

  Future<List<IotaNotification>> fetchNotifications({int limit = 50}) async {
    final data = await _client
        .from('iota_notifications')
        .select()
        .order('created_at', ascending: false)
        .limit(limit);

    return data.map<IotaNotification>((item) => IotaNotification.fromMap(item)).toList();
  }

  Future<void> markNotificationAsRead(String notificationId) async {
    await _client
        .from('iota_notifications')
        .update({'is_read': true})
        .eq('id', notificationId);
  }
}
