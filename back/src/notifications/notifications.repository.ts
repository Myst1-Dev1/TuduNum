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
    const notification = this.repo.create(data);
    return this.repo.save(notification);
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
}
