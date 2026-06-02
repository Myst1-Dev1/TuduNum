import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PushSubscription } from './entities/push-subscription.entity';

@Injectable()
export class PushSubscriptionsRepository {
  constructor(
    @InjectRepository(PushSubscription)
    private readonly repo: Repository<PushSubscription>,
  ) {}

  async upsertForUser(
    userId: string,
    data: Partial<PushSubscription>,
  ): Promise<PushSubscription> {
    const existing = await this.repo.findOne({
      where: { endpoint: data.endpoint },
    });

    if (existing) {
      existing.userId = userId;
      existing.p256dh = data.p256dh ?? existing.p256dh;
      existing.auth = data.auth ?? existing.auth;
      existing.userAgent = data.userAgent ?? existing.userAgent;
      existing.revokedAt = null;

      return this.repo.save(existing);
    }

    const created = this.repo.create({
      ...data,
      userId,
    });

    return this.repo.save(created);
  }

  async findActiveByUser(userId: string): Promise<PushSubscription[]> {
    return this.repo.find({
      where: {
        userId,
        revokedAt: IsNull(),
      },
    });
  }

  async findActiveByEndpoint(
    endpoint: string,
  ): Promise<PushSubscription | null> {
    return this.repo.findOne({
      where: {
        endpoint,
        revokedAt: IsNull(),
      },
    });
  }

  async revokeByEndpoint(userId: string, endpoint: string): Promise<boolean> {
    const res = await this.repo.update(
      {
        userId,
        endpoint,
      },
      {
        revokedAt: new Date(),
      },
    );

    return (res.affected ?? 0) > 0;
  }

  async revokeById(id: string): Promise<boolean> {
    const res = await this.repo.update(id, {
      revokedAt: new Date(),
    });

    return (res.affected ?? 0) > 0;
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const count = await this.repo.count({
      where: {
        userId,
        revokedAt: IsNull(),
      },
    });

    return count > 0;
  }

  async findAll(): Promise<PushSubscription[]> {
    return this.repo.find();
  }
}
