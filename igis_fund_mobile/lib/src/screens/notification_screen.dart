import 'package:flutter/material.dart';
import '../models/iota_notification.dart';
import '../services/platform_repository.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key, required this.repository});

  final PlatformRepository repository;

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  late Future<List<IotaNotification>> _notificationsFuture;

  @override
  void initState() {
    super.initState();
    _notificationsFuture = widget.repository.fetchNotifications();
  }

  Future<void> _refresh() async {
    setState(() {
      _notificationsFuture = widget.repository.fetchNotifications();
    });
  }

  Future<void> _markAsRead(IotaNotification notification) async {
    if (notification.isRead) return;

    try {
      await widget.repository.markNotificationAsRead(notification.id);
      _refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('알림 읽음 처리에 실패했습니다.')),
        );
      }
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes == 0) {
          return '방금 전';
        }
        return '${difference.inMinutes}분 전';
      }
      return '${difference.inHours}시간 전';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}일 전';
    } else {
      return '${date.year}.${date.month.toString().padLeft(2, '0')}.${date.day.toString().padLeft(2, '0')}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: FutureBuilder<List<IotaNotification>>(
        future: _notificationsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Center(child: Text('알림을 불러오지 못했습니다.')),
                ),
              ],
            );
          }

          final notifications = snapshot.data ?? [];

          if (notifications.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Center(
                    child: Text(
                      '새로운 알림이 없습니다.',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                ),
              ],
            );
          }

          return ListView.separated(
            itemCount: notifications.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final notification = notifications[index];
              final isRead = notification.isRead;

              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                tileColor: isRead ? null : Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.3),
                leading: CircleAvatar(
                  backgroundColor: isRead ? Colors.grey.shade300 : Theme.of(context).colorScheme.primaryContainer,
                  child: Icon(
                    Icons.notifications,
                    color: isRead ? Colors.grey.shade600 : Theme.of(context).colorScheme.primary,
                  ),
                ),
                title: Text(
                  notification.title,
                  style: TextStyle(
                    fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                      notification.body,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: isRead ? Colors.grey.shade600 : null,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(notification.createdAt),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
                onTap: () => _markAsRead(notification),
              );
            },
          );
        },
      ),
    );
  }
}
