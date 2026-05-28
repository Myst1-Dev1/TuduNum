import { Notification } from '../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  sent: boolean;
  reminderId: string | null;
  readAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      sent: notification.sent,
      reminderId: notification.reminderId,
      readAt: notification.readAt,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
