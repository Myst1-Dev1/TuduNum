import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import { WebPushNotificationChannel } from './channels/web-push-notification.channel';
import { NotificationsRepository } from '../notifications.repository';

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);

  constructor(
    private readonly webPushChannel: WebPushNotificationChannel,
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async dispatch(notification: Notification): Promise<void> {
    try {
      // For now only web push
      const sent = await this.webPushChannel.send(notification);
      if (sent) {
        this.logger.log(`Notification ${notification.id} dispatched via web-push`);
        try {
          await this.notificationsRepository.markAsSent(notification.id);
        } catch (err) {
          this.logger.warn('Failed to mark notification as sent: ' + String(err));
        }
      } else {
        this.logger.debug(`Notification ${notification.id} had no delivery via web-push`);
      }
    } catch (err) {
      this.logger.warn('Dispatch error: ' + String(err));
    }
  }
}
