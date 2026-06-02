/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async findAllByUser(
    userId: string,
    skip: number,
    take: number,
  ): Promise<[Notification[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async findByIdAndUser(
    id: string,
    userId: string,
  ): Promise<Notification | null> {
    return this.repo.findOne({
      where: { id, userId },
    });
  }

  async create(data: Partial<Notification>): Promise<Notification> {
    // If reminderId is present, rely on DB unique constraint to avoid duplicates
    if (data.reminderId) {
      const cols = [
        'user_id',
        'type',
        'title',
        'message',
        'reminder_id',
        'created_at',
        'updated_at',
      ];

      const values = [
        data.userId,
        data.type,
        data.title,
        data.message ?? null,
        data.reminderId,
        new Date(),
        new Date(),
      ];

      // Use parameterized query to insert with ON CONFLICT DO NOTHING and return the inserted row
      const res = await this.repo.query(
        `INSERT INTO notifications (${cols.map((c) => `"${c}"`).join(',')}) VALUES (${cols
          .map((_, i) => `$${i + 1}`)
          .join(',')}) ON CONFLICT (reminder_id,type) DO NOTHING RETURNING *`,
        values,
      );

      const inserted = res[0];

      if (res && res.length > 0) {
        return this.repo.create(inserted as Partial<Notification>);
      }

      // If the insert did nothing, return the existing notification for that reminder/type
      const existing = await this.repo.findOne({
        where: { reminderId: data.reminderId, type: data.type },
      });

      if (existing) return existing;

      // Fallback to normal create
      const notification = this.repo.create(data);
      return this.repo.save(notification);
    }

    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async findUnsentOlderThan(minutes: number, limit = 100): Promise<Notification[]> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.repo.find({
      where: { sent: false },
      order: { createdAt: 'ASC' },
      take: limit,
    }).then((rows) => rows.filter((r) => r.createdAt < cutoff));
  }

  async save(notification: Notification): Promise<Notification> {
    return this.repo.save(notification);
  }

  async countUnreadByUser(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, read: false } });
  }

  async markAllAsReadByUser(userId: string): Promise<void> {
    await this.repo.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
  }

  async markAsSent(id: string): Promise<void> {
    await this.repo.update(id, { sent: true, sentAt: new Date() });
  }
}
