import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RemindersRepository } from './reminders.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Injectable()
export class ReminderNotificationsScheduler {
  private readonly logger = new Logger(ReminderNotificationsScheduler.name);

  constructor(
    private readonly remindersRepository: RemindersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('* * * * *') // every minute
  async handleReminders(): Promise<void> {
    const now = new Date();
    this.logger.debug('Checking pending reminders at ' + now.toISOString());

    const reminders = await this.remindersRepository.findPendingNotifications(now);
    for (const r of reminders) {
      // Try to claim the reminder atomically to avoid duplicates across concurrent scheduler runs
      const claimed = await this.remindersRepository.claimNotification(r.id);
      if (!claimed) {
        this.logger.debug('Reminder already claimed by another worker: ' + r.id);
        continue;
      }

      try {
        await this.notificationsService.create(r.userId, {
          type: NotificationType.REMINDER,
          title: r.title,
          message: r.description ?? undefined,
          reminderId: r.id,
        });
        // already claimed (notificationSent=true) — nothing else to do
      } catch (err) {
        this.logger.warn('Failed creating notification for reminder ' + r.id + ': ' + String(err));
        // revert claim so it can be retried
        try {
          await this.remindersRepository.unclaimNotification(r.id);
        } catch (e) {
          this.logger.warn('Failed reverting claim for reminder ' + r.id + ': ' + String(e));
        }
      }
    }
  }
}
