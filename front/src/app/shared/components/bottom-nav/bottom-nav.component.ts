import { Component } from '@angular/core';
import { CalendarDays, Cloud, LucideAngularModule, Map } from 'lucide-angular';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <nav class="grid grid-cols-3 rounded-t-lg border border-white/5 bg-[#11192d]/95 px-6 py-2 shadow-[0_-12px_28px_rgba(20,60,150,0.16)]">
      <button class="flex flex-col items-center gap-1 text-[#9fbcff]" aria-label="Home">
        <span class="grid h-9 w-14 place-items-center rounded-full bg-[#2f7dff] text-white shadow-[0_0_18px_rgba(47,125,255,0.55)]">
          <lucide-angular [img]="CalendarDays" [size]="16" [strokeWidth]="2"></lucide-angular>
        </span>
        <span class="text-[10px] font-semibold">Home</span>
      </button>

      <button class="flex flex-col items-center justify-end gap-1 pb-1 text-[#75839d]" aria-label="Weather">
        <lucide-angular [img]="Cloud" [size]="16" [strokeWidth]="2"></lucide-angular>
        <span class="text-[10px] font-semibold">Weather</span>
      </button>

      <button class="flex flex-col items-center justify-end gap-1 pb-1 text-[#75839d]" aria-label="Map">
        <lucide-angular [img]="Map" [size]="16" [strokeWidth]="2"></lucide-angular>
        <span class="text-[10px] font-semibold">Map</span>
      </button>
    </nav>
  `,
})
export class BottomNavComponent {
  readonly CalendarDays = CalendarDays;
  readonly Cloud = Cloud;
  readonly Map = Map;
}
