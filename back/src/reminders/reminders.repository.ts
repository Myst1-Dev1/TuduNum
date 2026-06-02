import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, IsNull, Not, Repository } from 'typeorm';
import { Reminder } from './entities/reminder.entity';
import { ReminderStatus } from './enums/reminder-status.enum';

@Injectable()
export class RemindersRepository {
  constructor(
    @InjectRepository(Reminder)
    private readonly repo: Repository<Reminder>,
  ) {}

  async findAllByUser(
    userId: string,
    skip: number,
    take: number,
  ): Promise<[Reminder[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      order: { reminderDate: 'ASC' },
      skip,
      take,
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Reminder | null> {
    return this.repo.findOne({
      where: { id, userId },
    });
  }

  async create(data: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.repo.create(data);
    return this.repo.save(reminder);
  }

  async save(reminder: Reminder): Promise<Reminder> {
    return this.repo.save(reminder);
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.softDelete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  async findPendingWeatherAlerts(
    now: Date,
    horizonHours: number,
  ): Promise<Reminder[]> {
    const horizon = new Date(now.getTime() + horizonHours * 60 * 60 * 1000);

    return this.repo.find({
      where: {
        status: ReminderStatus.PENDING,
        weatherChecked: false,
        city: Not(IsNull()),
        reminderDate: LessThanOrEqual(horizon),
      },
      order: { reminderDate: 'ASC' },
    });
  }

  async markWeatherChecked(id: string): Promise<void> {
    await this.repo.update(id, { weatherChecked: true });
  }

  async findPendingNotifications(now: Date): Promise<Reminder[]> {
    return this.repo.find({
      where: {
        status: ReminderStatus.PENDING,
        notificationSent: false,
        reminderDate: LessThanOrEqual(now),
      },
      order: { reminderDate: 'ASC' },
    });
  }

  async markNotificationSent(id: string): Promise<void> {
    await this.repo.update(id, { notificationSent: true });
  }

  async claimNotification(id: string): Promise<boolean> {
    const res = await this.repo
      .createQueryBuilder()
      .update(Reminder)
      .set({ notificationSent: true })
      .where('id = :id AND notification_sent = false', { id })
      .returning('id')
      .execute();

    // Depending on DB driver, use affected or raw
    const affected = (res.affected ?? (res.raw && res.raw.length ? res.raw.length : 0));
    return affected > 0;
  }

  async unclaimNotification(id: string): Promise<void> {
    await this.repo.update(id, { notificationSent: false });
  }
}
