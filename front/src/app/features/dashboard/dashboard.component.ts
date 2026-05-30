import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';
import { OnlineService } from '@core/services/online.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white transition-colors duration-300">
      <header class="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border px-6 py-4 flex items-center justify-between shadow-premium">
        <h1 class="text-2xl font-extrabold tracking-tight font-sans">TuduNum</h1>
        <div class="flex items-center gap-4">
          <span [class]="onlineService.isOnline() ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'" 
                class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" [class]="onlineService.isOnline() ? 'bg-emerald-500' : 'bg-rose-500'"></span>
            {{ onlineService.isOnline() ? 'Online' : 'Offline' }}
          </span>
          <button (click)="logout()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-card dark:hover:bg-dark-border border border-slate-200 dark:border-dark-border rounded-lg text-sm font-semibold transition-all">
            Sair
          </button>
        </div>
      </header>
      <main class="max-w-7xl mx-auto p-6">
        <!-- Stub para layout do Dashboard -->
        <div class="border-2 border-dashed border-slate-200 dark:border-dark-border rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
          Layout do Painel Principal (Astro)
        </div>
      </main>
    </div>
  `
})
export default class DashboardComponent {
  public authService = inject(AuthService);
  public onlineService = inject(OnlineService);

  public logout(): void {
    this.authService.logout();
  }
}
