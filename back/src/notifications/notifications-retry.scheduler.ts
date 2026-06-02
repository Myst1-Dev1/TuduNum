import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsRepository } from './notifications.repository';
import { NotificationDispatchService } from './dispatch/notification-dispatch.service';

@Injectable()
export class NotificationsRetryScheduler {
  private readonly logger = new Logger(NotificationsRetryScheduler.name);

  constructor(
    private readonly repo: NotificationsRepository,
    private readonly dispatchService: NotificationDispatchService,
  ) {}

  // Run every 5 minutes
  @Cron('*/5 * * * *')
  async handleRetries(): Promise<void> {
    try {
      this.logger.debug('Checking unsent notifications for retry');
      const unsent = await this.repo.findUnsentOlderThan(5, 100);
      if (!unsent || unsent.length === 0) return;

      for (const n of unsent) {
        try {
          await this.dispatchService.dispatch(n);
        } catch (err) {
          this.logger.warn('Retry dispatch failed for ' + n.id + ': ' + String(err));
        }
      }
    } catch (err) {
      this.logger.warn('Retry scheduler error: ' + String(err));
    }
  }
}
