import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly vapidUrl = 'https://lab.mystdev.com.br/api/tudu-num-api/push/vapid-public-key';
  private readonly subscriptionsUrl = 'https://lab.mystdev.com.br/api/tudu-num-api/push-subscriptions';

  constructor(private swPush: SwPush, private http: HttpClient) {}

  // Helper to convert base64 VAPID key to Uint8Array required by the browser
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Request subscription and register it on the backend
  async subscribe(userId: string, userAgent?: string): Promise<boolean> {
    try {
      const vapid = await firstValueFrom(this.http.get<{ publicKey: string }>(this.vapidUrl));
      console.debug('[PushService] fetched VAPID response:', vapid);
      if (!vapid || !vapid.publicKey) {
        console.error('[PushService] VAPID publicKey missing from response');
        return false;
      }
      const options = { applicationServerKey: this.urlBase64ToUint8Array(vapid.publicKey), userVisibleOnly: true } as any;
      if (!('serviceWorker' in navigator)) {
        console.error('[PushService] Service Worker not supported in this browser');
        return false;
      }

      // sanity check the applicationServerKey
      if (!options.applicationServerKey || !(options.applicationServerKey instanceof Uint8Array)) {
        console.error('[PushService] invalid applicationServerKey', options.applicationServerKey);
        return false;
      }
      const sub = await this.swPush.requestSubscription(options);
      const payload: PushSubscriptionPayload = {
        endpoint: sub.endpoint,
        keys: { p256dh: (sub as any).getKey ? this.arrayBufferToBase64((sub as any).getKey('p256dh')) : '', auth: (sub as any).getKey ? this.arrayBufferToBase64((sub as any).getKey('auth')) : '' },
      };

      // send to backend in base64url form (replace +/ with -_)
      const toBase64Url = (b64: string) => b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await this.http.post(this.subscriptionsUrl, {
        endpoint: payload.endpoint,
        p256dh: toBase64Url(payload.keys.p256dh),
        auth: toBase64Url(payload.keys.auth),
        userAgent: userAgent || navigator.userAgent,
      }).toPromise();

      return true;
    } catch (err) {
      console.warn('[PushService] subscribe failed', err);
      return false;
    }
  }

  async unsubscribe(userId: string): Promise<boolean> {
    try {
      const sub = await this.swPush.subscription.toPromise();
      if (!sub) return true;

      const endpoint = sub.endpoint;
      await this.http.delete(this.subscriptionsUrl, { body: { endpoint } }).toPromise();
      await sub.unsubscribe();
      return true;
    } catch (err) {
      console.warn('[PushService] unsubscribe failed', err);
      return false;
    }
  }

  // utility to convert ArrayBuffer key to base64
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Expose incoming push messages when app is in foreground
  onMessage() {
    return this.swPush.messages;
  }
}
