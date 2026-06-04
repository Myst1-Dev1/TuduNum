import { Component } from '@angular/core';
import { LucideAngularModule, Menu, Bell } from 'lucide-angular';
import { PushService } from '../../../core/services/push.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="flex items-center justify-between px-4 pt-3">
      <!-- <div class="flex items-center gap-2"> -->
        <!-- <button class="grid h-7 w-7 place-items-center text-[#91a0bd]" aria-label="Abrir menu">
          <lucide-angular [img]="Menu" [size]="18" [strokeWidth]="2"></lucide-angular>
        </button> -->
        <h1 class="text-[26px] font-bold leading-none text-[#9fbcff] drop-shadow-[0_0_8px_rgba(159,188,255,0.35)]">
          TuduNum
        </h1>
      <!-- </div> -->

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <button (click)="togglePush()" class="relative h-8 w-8 grid place-items-center text-[#91a0bd] hover:text-white transition-colors" aria-label="Notificações">
            <lucide-angular [img]="Bell" [size]="18" [strokeWidth]="2"></lucide-angular>
            
            <span class="absolute top-1 right-1 flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </button>
        </div>

        <button class="h-8 w-8 overflow-hidden rounded-full border border-[#2a3b5d] bg-[#1b2740]" aria-label="Perfil">
          <img
            class="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80"
            alt=""
          />
        </button>
      </div>
    </header>
  `,
})
export class AppHeaderComponent {
  readonly Menu = Menu;
  readonly Bell = Bell;

  private subscribed = false;

  constructor(private push: PushService) {}

  async togglePush() {
    if (!this.subscribed) {
      const ok = await this.push.subscribe('me');
      this.subscribed = ok;
      alert('Push subscription result:' + ok);
      if (ok) alert('Inscrito para notificações');
      else alert('Falha ao inscrever para notificações');
    } else {
      const ok = await this.push.unsubscribe('me');
      this.subscribed = !ok ? this.subscribed : false;
      if (ok) alert('Cancelado recebimento de notificações');
    }
  }
}
