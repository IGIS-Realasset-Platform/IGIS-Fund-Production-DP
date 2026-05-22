class IotaNotification {
  const IotaNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    this.type,
    this.referenceId,
    required this.isRead,
    required this.createdAt,
  });

  final String id;
  final String userId;
  final String title;
  final String body;
  final String? type;
  final String? referenceId;
  final bool isRead;
  final DateTime createdAt;

  factory IotaNotification.fromMap(Map<String, dynamic> map) {
    return IotaNotification(
      id: map['id'] as String,
      userId: map['user_id'] as String,
      title: map['title'] as String,
      body: map['body'] as String,
      type: map['type'] as String?,
      referenceId: map['reference_id'] as String?,
      isRead: map['is_read'] as bool? ?? false,
      createdAt: DateTime.parse(map['created_at'] as String),
    );
  }
}
