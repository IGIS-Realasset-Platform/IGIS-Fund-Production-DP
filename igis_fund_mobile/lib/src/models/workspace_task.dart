class WorkspaceTask {
  const WorkspaceTask({
    required this.id,
    required this.taskName,
    required this.companyName,
    required this.relatedAsset,
    required this.status,
    required this.priority,
    required this.dueDate,
    required this.nextAction,
    required this.createdAt,
  });

  final String id;
  final String taskName;
  final String companyName;
  final String relatedAsset;
  final String status;
  final String priority;
  final DateTime? dueDate;
  final String nextAction;
  final DateTime? createdAt;

  String get companyLabel {
    final value = companyName.trim();
    return value.isEmpty ? '내부업무' : value;
  }

  bool get isCoreAsset {
    final value = relatedAsset.toLowerCase();
    return value.contains('iota') ||
        value.contains('이오타') ||
        value.contains('427') ||
        value.contains('816') ||
        value.contains('421') ||
        value.contains('공통');
  }

  factory WorkspaceTask.fromMap(Map<String, dynamic> map) {
    return WorkspaceTask(
      id: (map['id'] ?? '').toString(),
      taskName: (map['task_name'] ?? '').toString(),
      companyName: (map['company_name'] ?? '').toString(),
      relatedAsset: (map['related_asset'] ?? 'IOTA 공통').toString(),
      status: (map['status'] ?? '아이데이션').toString(),
      priority: (map['priority'] ?? '중간').toString(),
      dueDate: DateTime.tryParse((map['due_date'] ?? '').toString()),
      nextAction: (map['next_action'] ?? '').toString(),
      createdAt: DateTime.tryParse((map['created_at'] ?? '').toString()),
    );
  }
}
