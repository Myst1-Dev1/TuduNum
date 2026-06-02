import { Component, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'front';

  constructor() {
    // Register the lightweight custom push service worker that displays
    // notifications when 'push' events arrive. This runs alongside the
    // Angular service worker (ngsw-worker.js).
    if ('serviceWorker' in navigator && !isDevMode()) {
      navigator.serviceWorker.register('/push-sw.js').catch((err) => {
        console.warn('Failed registering push-sw.js', err);
      });
    }
  }
}
