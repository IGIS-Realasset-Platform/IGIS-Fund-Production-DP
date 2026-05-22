class LogVisibilitySetting {
  const LogVisibilitySetting({
    this.groups = const [],
    this.individuals = const [],
  });

  final List<String> groups;
  final List<String> individuals;

  factory LogVisibilitySetting.all() {
    return const LogVisibilitySetting();
  }

  factory LogVisibilitySetting.restricted({
    List<String> groups = const [],
    List<String> individuals = const [],
  }) {
    return LogVisibilitySetting(
      groups: groups.map((g) => g.trim()).where((g) => g.isNotEmpty).toList(),
      individuals: individuals.map((i) => i.trim()).where((i) => i.isNotEmpty).toList(),
    );
  }

  factory LogVisibilitySetting.workspace() {
    return const LogVisibilitySetting(groups: ['각 워크스페이스']);
  }

  factory LogVisibilitySetting.workspaces(List<List<String>> workspaceGroups) {
    final groups = <String>{};
    for (final workspaceGroup in workspaceGroups) {
      groups.addAll(
        workspaceGroup
            .map((group) => group.trim())
            .where((group) => group.isNotEmpty),
      );
    }
    return LogVisibilitySetting(groups: groups.toList());
  }

  factory LogVisibilitySetting.organization(String? orgName) {
    return LogVisibilitySetting(groups: [orgName?.trim() ?? '']);
  }

  factory LogVisibilitySetting.admins() {
    return const LogVisibilitySetting(groups: ['master', 'director']);
  }

  factory LogVisibilitySetting.people(List<String> emails) {
    return LogVisibilitySetting(individuals: emails);
  }

  factory LogVisibilitySetting.fromMap(Map<String, dynamic> map) {
    final groupsVal = map['groups'];
    final individualsVal = map['individuals'];
    return LogVisibilitySetting(
      groups: groupsVal is List
          ? groupsVal.map((e) => e.toString()).toList()
          : const [],
      individuals: individualsVal is List
          ? individualsVal.map((e) => e.toString()).toList()
          : const [],
    );
  }

  Map<String, dynamic> toMetadata() {
    return {
      'permissions': {
        'groups': groups,
        'individuals': individuals,
      }
    };
  }
}

enum LogVisibilityScope {
  workspace,
  organization,
  admins,
  people,
}

extension LogVisibilityScopeText on LogVisibilityScope {
  String get label {
    switch (this) {
      case LogVisibilityScope.workspace:
        return '워크스페이스';
      case LogVisibilityScope.organization:
        return '조직';
      case LogVisibilityScope.admins:
        return '관리자';
      case LogVisibilityScope.people:
        return '지정 인원';
    }
  }
}
