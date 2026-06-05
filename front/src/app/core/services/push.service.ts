import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly vapidUrl = 'https://lab.mystdev.com.br/api/tudu-num-api/push/vapid-public-key';
  private readonly subscriptionsUrl = 'https://lab.mystdev.com.br/api/tudu-num-api/push-subscriptions';
  private readonly isBrowser: boolean;

  constructor(
    private swPush: SwPush,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Verifica se o Service Worker e Push estão habilitados e ativos no browser
  async isSubscribed(): Promise<boolean> {
    if (!this.isBrowser || !this.swPush.isEnabled) return false;
    try {
      const sub = await firstValueFrom(this.swPush.subscription);
      return !!sub;
    } catch {
      return false;
    }
  }

  // Request subscription and register it on the backend
  async subscribe(userId: string, userAgent?: string): Promise<boolean> {
    try {
      if (!this.isBrowser) {
        console.warn('[PushService] subscribe skipped: platform is not browser');
        return false;
      }
      if (!this.swPush.isEnabled) {
        console.warn('[PushService] SwPush is not enabled (Service Worker inactive or not supported)');
        return false;
      }

      const vapid = await firstValueFrom(this.http.get<{ publicKey: string }>(this.vapidUrl));
      console.debug('[PushService] fetched VAPID response:', vapid);
      if (!vapid || !vapid.publicKey) {
        console.error('[PushService] VAPID publicKey missing from response');
        return false;
      }

      // O SwPush do Angular espera 'serverPublicKey' como string base64url
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: vapid.publicKey
      });

      const payload: PushSubscriptionPayload = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: (sub as any).getKey ? this.arrayBufferToBase64((sub as any).getKey('p256dh')) : '',
          auth: (sub as any).getKey ? this.arrayBufferToBase64((sub as any).getKey('auth')) : ''
        },
      };

      // send to backend in base64url form (replace +/ with -_)
      const toBase64Url = (b64: string) => b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await firstValueFrom(
        this.http.post(this.subscriptionsUrl, {
          endpoint: payload.endpoint,
          p256dh: toBase64Url(payload.keys.p256dh),
          auth: toBase64Url(payload.keys.auth),
          userAgent: userAgent || navigator.userAgent,
        })
      );

      return true;
    } catch (err) {
      console.warn('[PushService] subscribe failed', err);
      return false;
    }
  }

  async unsubscribe(userId: string): Promise<boolean> {
    try {
      if (!this.isBrowser || !this.swPush.isEnabled) return true;

      const sub = await firstValueFrom(this.swPush.subscription);
      if (!sub) return true;

      const endpoint = sub.endpoint;
      await firstValueFrom(this.http.delete(this.subscriptionsUrl, { body: { endpoint } }));
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
