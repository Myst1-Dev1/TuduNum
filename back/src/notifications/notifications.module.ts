import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';
import { PushModule } from '../push/push.module';
import { PushSubscriptionsModule } from '../push-subscriptions/push-subscriptions.module';
import { WebPushNotificationChannel } from './dispatch/channels/web-push-notification.channel';
import { NotificationDispatchService } from './dispatch/notification-dispatch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), PushModule, PushSubscriptionsModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    WebPushNotificationChannel,
    NotificationDispatchService,
    // retry scheduler
    (require('./notifications-retry.scheduler').NotificationsRetryScheduler),
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
