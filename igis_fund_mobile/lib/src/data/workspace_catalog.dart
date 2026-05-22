import '../models/member_profile.dart';

class WorkspaceInfo {
  const WorkspaceInfo({
    required this.code,
    required this.label,
    required this.orgNames,
    required this.taskTable,
    required this.focusLabel,
  });

  final String code;
  final String label;
  final List<String> orgNames;
  final String taskTable;
  final String focusLabel;

  bool matchesOrg(String? orgName) {
    final normalized = orgName?.trim();
    if (normalized == null || normalized.isEmpty) {
      return false;
    }
    return orgNames.any(
      (name) => normalized == name || normalized.contains(name),
    );
  }

  List<String> get visibilityGroups {
    return {
      code,
      label,
      focusLabel,
      ...orgNames,
    }.where((value) => value.trim().isNotEmpty).toList();
  }

  bool matchesVisibilityGroup(String group) {
    final normalized = group.trim();
    if (normalized.isEmpty) {
      return false;
    }
    return visibilityGroups.any(
      (value) => value == normalized || normalized.contains(value),
    );
  }
}

const workspaceCatalog = <WorkspaceInfo>[
  WorkspaceInfo(
    code: 'WS_PM',
    label: '사업 PM',
    orgNames: ['사업PM', '사업 PM'],
    taskTable: 'iota_pm_tasks',
    focusLabel: '사업 PM',
  ),
  WorkspaceInfo(
    code: 'WS_LFC',
    label: '파이낸싱-LFC',
    orgNames: ['파이낸싱'],
    taskTable: 'iota_financing_tasks',
    focusLabel: '파이낸싱',
  ),
  WorkspaceInfo(
    code: 'WS_DSC',
    label: '개발솔루션-DSC',
    orgNames: ['개발관리', '개발솔루션'],
    taskTable: 'iota_development_tasks',
    focusLabel: '개발솔루션',
  ),
  WorkspaceInfo(
    code: 'WS_EMC',
    label: '기업마케팅-EMC',
    orgNames: ['기업마케팅'],
    taskTable: 'iota_marketing_tasks',
    focusLabel: '기업마케팅',
  ),
  WorkspaceInfo(
    code: 'WS_SSC',
    label: '공간솔루션-SSC',
    orgNames: ['상품·디지털', '공간솔루션'],
    taskTable: 'iota_digital_tasks',
    focusLabel: '공간솔루션',
  ),
  WorkspaceInfo(
    code: 'WS_KAM',
    label: '펀드운용-KAM',
    orgNames: ['펀드운용'],
    taskTable: 'iota_fund_tasks',
    focusLabel: '펀드운용',
  ),
  WorkspaceInfo(
    code: 'WS_IPR',
    label: 'IPR',
    orgNames: ['IPR'],
    taskTable: 'iota_ipr_tasks',
    focusLabel: 'IPR',
  ),
];

WorkspaceInfo workspaceForMemberOrg(String? orgName) {
  return workspaceCatalog.firstWhere(
    (workspace) => workspace.matchesOrg(orgName),
    orElse: () => workspaceCatalog.first,
  );
}

List<WorkspaceInfo> visibleWorkspacesForMember(MemberProfile? member) {
  if (member == null) {
    return const [];
  }

  // 관리자는 모든 게시판 목록을 조회할 수 있음 (하지만 개별 글 열람 권한은 별개임)
  if (member.isGlobalAdmin) {
    return workspaceCatalog;
  }

  List<WorkspaceInfo> ownWorkspace = [];
  
  if (member.workspaceCode != null && member.workspaceCode!.isNotEmpty) {
    ownWorkspace = workspaceCatalog
        .where((workspace) => workspace.code == member.workspaceCode)
        .toList();
  }

  if (ownWorkspace.isEmpty) {
    ownWorkspace = workspaceCatalog
        .where((workspace) => workspace.matchesOrg(member.orgName))
        .toList();
  }
  
  // 만약 일치하는 워크스페이스가 전혀 없다면 최소한 하나라도(기본값) 반환하여 앱 크래시 방지
  if (ownWorkspace.isEmpty) {
    return [workspaceCatalog.first];
  }
  return ownWorkspace;
}
