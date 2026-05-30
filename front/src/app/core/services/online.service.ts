import { Injectable, signal, NgZone, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {
  private ngZone = inject(NgZone);
  
  // Signal reativo expondo o estado de conectividade
  private _isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  public isOnline = this._isOnline.asReadonly();

  constructor() {
    this.registerEvents();
  }

  private registerEvents(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.ngZone.run(() => this._isOnline.set(true));
      });

      window.addEventListener('offline', () => {
        this.ngZone.run(() => this._isOnline.set(false));
      });
    }
  }
}
