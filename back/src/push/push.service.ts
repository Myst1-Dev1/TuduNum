import { Inject, Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(@Inject('VAPID_CONFIG') private readonly vapid: any) {
    // configure web-push library
    try {
      webpush.setVapidDetails(this.vapid.subject, this.vapid.publicKey, this.vapid.privateKey);
      this.logger.log('VAPID configured');
    } catch (err) {
      this.logger.warn('Failed configuring VAPID for web-push: ' + String(err));
    }
  }

  async send(subscription: any, payload: any): Promise<{ ok: boolean; status?: number; error?: any }> {
    try {
      const res = await webpush.sendNotification(subscription, JSON.stringify(payload));
      // web-push returns a Response-like object in some runtimes
      const status = (res && (res.status || (res.statusCode ?? res.status))) || 201;
      return { ok: true, status };
    } catch (err: any) {
      this.logger.warn('Push send error: ' + (err && err.message ? err.message : String(err)));
      const status = err && (err.statusCode || err.status) ? (err.statusCode || err.status) : undefined;
      return { ok: false, status, error: err };
    }
  }
}
