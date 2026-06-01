import { Component } from '@angular/core';
import { LucideAngularModule, Menu } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="flex items-center justify-between px-4 pt-3">
      <div class="flex items-center gap-2">
        <button class="grid h-7 w-7 place-items-center text-[#91a0bd]" aria-label="Abrir menu">
          <lucide-angular [img]="Menu" [size]="18" [strokeWidth]="2"></lucide-angular>
        </button>
        <h1 class="text-[26px] font-bold leading-none text-[#9fbcff] drop-shadow-[0_0_8px_rgba(159,188,255,0.35)]">
          TuduNu
        </h1>
      </div>

      <button class="h-8 w-8 overflow-hidden rounded-full border border-[#2a3b5d] bg-[#1b2740]" aria-label="Perfil">
        <img
          class="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80"
          alt=""
        />
      </button>
    </header>
  `,
})
export class AppHeaderComponent {
  readonly Menu = Menu;
}
