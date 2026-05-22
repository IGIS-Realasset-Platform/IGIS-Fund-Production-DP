class MemberProfile {
  const MemberProfile({
    required this.email,
    required this.name,
    this.orgName,
    this.roleCode,
    this.workspaceCode,
  });

  final String email;
  final String name;
  final String? orgName;
  final String? roleCode;
  final String? workspaceCode;

  String get normalizedEmail => email.trim().toLowerCase();

  String get normalizedRoleCode => roleCode?.trim().toLowerCase() ?? '';
  String get normalizedWorkspaceCode => workspaceCode?.trim().toUpperCase() ?? '';

  bool get isGlobalAdmin {
    return normalizedRoleCode == 'master' || 
           normalizedRoleCode == 'director' || 
           normalizedWorkspaceCode == 'WS_MASTER';
  }

  bool belongsToOrg(String org) {
    final currentOrg = orgName?.trim();
    final targetOrg = org.trim();
    if (currentOrg == null || currentOrg.isEmpty || targetOrg.isEmpty) {
      return false;
    }
    return currentOrg == targetOrg || currentOrg.contains(targetOrg);
  }

  factory MemberProfile.fromMap(Map<String, dynamic> map) {
    return MemberProfile(
      email: (map['email'] ?? '').toString(),
      name: (map['staff_name'] ?? map['name'] ?? '사용자').toString(),
      orgName: map['org_name']?.toString(),
      roleCode: map['role_code']?.toString(),
      workspaceCode: map['workspace_code']?.toString(),
    );
  }
}
