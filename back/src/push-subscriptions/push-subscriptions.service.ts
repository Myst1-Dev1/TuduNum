import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PushSubscriptionsRepository } from './push-subscriptions.repository';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';

@Injectable()
export class PushSubscriptionsService {
  private readonly logger = new Logger(PushSubscriptionsService.name);
  constructor(private readonly repo: PushSubscriptionsRepository) {}

  async registerForUser(userId: string, dto: CreatePushSubscriptionDto): Promise<void> {
    // Validate keys (base64url -> base64) before saving to avoid invalid entries
    try {
      const toBase64 = (v: string) => {
        // convert base64url to base64
        let s = v.replace(/-/g, '+').replace(/_/g, '/');
        while (s.length % 4) s += '=';
        return s;
      };

      const p256 = Buffer.from(toBase64(dto.p256dh), 'base64');
      const auth = Buffer.from(toBase64(dto.auth), 'base64');

      // p256dh should decode to 65 bytes (uncompressed public key)
      if (p256.length !== 65) {
        throw new Error('Invalid p256dh length');
      }

      if (auth.length < 8 || auth.length > 64) {
        throw new Error('Invalid auth length');
      }
    } catch (err) {
      this.logger.warn('Rejected invalid subscription keys: ' + String(err));
      throw new BadRequestException('Invalid subscription keys');
    }

    await this.repo.upsertForUser(userId, {
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      auth: dto.auth,
      userAgent: dto.userAgent ?? null,
    });
  }

  async revokeForUserByEndpoint(userId: string, endpoint: string): Promise<void> {
    await this.repo.revokeByEndpoint(userId, endpoint);
  }

  async getStatus(userId: string): Promise<boolean> {
    return this.repo.hasActiveSubscription(userId);
  }

  async findActiveByUser(userId: string) {
    return this.repo.findActiveByUser(userId);
  }

  async findActiveByEndpoint(endpoint: string) {
    return this.repo.findActiveByEndpoint(endpoint);
  }

  async validateAll(): Promise<{
    id: string;
    endpoint: string;
    valid: boolean;
    errors: string[];
  }[]> {
    const rows = await this.repo.findAll();
    const toBase64 = (v: string) => {
      let s = v.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return s;
    };

    const results = [] as any[];
    for (const r of rows) {
      const errors: string[] = [];
      try {
        if (!r.p256dh) errors.push('missing p256dh');
        if (!r.auth) errors.push('missing auth');

        if (r.p256dh) {
          const p = Buffer.from(toBase64(r.p256dh), 'base64');
          if (p.length !== 65) errors.push('p256dh length != 65');
        }

        if (r.auth) {
          const a = Buffer.from(toBase64(r.auth), 'base64');
          if (a.length < 8 || a.length > 64) errors.push('auth length invalid');
        }
      } catch (err) {
        errors.push('decode error');
      }

      results.push({ id: r.id, endpoint: r.endpoint, valid: errors.length === 0, errors });
    }

    return results;
  }
}
