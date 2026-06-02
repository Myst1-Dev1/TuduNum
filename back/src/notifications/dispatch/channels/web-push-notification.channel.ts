import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '../../entities/notification.entity';
import { NotificationChannel } from './notification-channel.interface';
import { PushService } from '../../../push/push.service';
import { PushSubscriptionsService } from '../../../push-subscriptions/push-subscriptions.service';

@Injectable()
export class WebPushNotificationChannel implements NotificationChannel {
  private readonly logger = new Logger(WebPushNotificationChannel.name);

  constructor(
    private readonly pushService: PushService,
    private readonly subscriptionsService: PushSubscriptionsService,
  ) {}

  async send(notification: Notification): Promise<boolean> {
    const subs = await this.subscriptionsService.findActiveByUser(notification.userId);
    if (!subs || subs.length === 0) {
      this.logger.debug('No subscriptions for user ' + notification.userId);
      return false;
    }

    const payload = {
      title: notification.title,
      message: notification.message,
      data: { notificationId: notification.id, reminderId: notification.reminderId },
      timestamp: new Date().toISOString(),
    };

    let anyOk = false;
    for (const s of subs) {
      const subObj = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      };

      const res = await this.pushService.send(subObj, payload);
      if (res.ok) {
        anyOk = true;
      } else {
        const errMsg = res.error && res.error.message ? res.error.message : '';
        // If subscription is no longer valid, revoke it
        if (res.status === 404 || res.status === 410) {
          this.logger.log('Revoking invalid subscription (404/410): ' + s.endpoint);
          try {
            await this.subscriptionsService.revokeForUserByEndpoint(s.userId, s.endpoint);
          } catch (err) {
            this.logger.warn('Failed to revoke subscription: ' + String(err));
          }
        } else if (errMsg.includes('p256dh') || errMsg.includes('auth') || errMsg.includes('Invalid')) {
          // Bad key format — revoke to avoid repeated failures
          this.logger.log('Revoking subscription due to invalid keys: ' + s.endpoint + ' - ' + errMsg);
          try {
            await this.subscriptionsService.revokeForUserByEndpoint(s.userId, s.endpoint);
          } catch (err) {
            this.logger.warn('Failed to revoke subscription: ' + String(err));
          }
        } else {
          this.logger.debug('Push send failed for ' + s.endpoint + ': ' + errMsg);
        }
      }
    }

    return anyOk;
  }
}
