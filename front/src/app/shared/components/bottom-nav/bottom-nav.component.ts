import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CalendarDays, Cloud, LucideAngularModule, Map } from 'lucide-angular';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="grid grid-cols-3 rounded-t-lg border border-white/5 bg-[#11192d]/95 px-6 py-2 shadow-[0_-12px_28px_rgba(20,60,150,0.16)]">
      
      <a routerLink="/dashboard" 
        routerLinkActive="text-[#9fbcff]" 
        #homeLink="routerLinkActive"
        [routerLinkActiveOptions]="{exact: true}"
        class="flex flex-col items-center gap-1 text-[#75839d] cursor-pointer" 
        aria-label="Home">
        <span class="grid h-9 w-14 place-items-center rounded-full transition-all duration-200"
              [class.bg-[#2f7dff]]="homeLink.isActive"
              [class.text-white]="homeLink.isActive"
              [class.shadow-[0_0_18px_rgba(47,125,255,0.55)]]="homeLink.isActive">
          <lucide-angular [img]="CalendarDays" [size]="16" [strokeWidth]="2"></lucide-angular>
        </span>
        <span class="text-[10px] font-semibold">Home</span>
      </a>

      <a routerLink="/weather" 
        routerLinkActive="text-[#9fbcff]"
        #weatherLink="routerLinkActive"
        [routerLinkActiveOptions]="{exact: true}"
        class="flex flex-col items-center justify-end gap-1 pb-1 text-[#75839d] cursor-pointer" 
        aria-label="Weather">
        <span class="grid h-9 w-14 place-items-center rounded-full transition-all duration-200"
              [class.bg-[#2f7dff]]="weatherLink.isActive"
              [class.text-white]="weatherLink.isActive"
              [class.shadow-[0_0_18px_rgba(47,125,255,0.55)]]="weatherLink.isActive">
          <lucide-angular [img]="Cloud" [size]="16" [strokeWidth]="2"></lucide-angular>
        </span>
        <span class="text-[10px] font-semibold">Weather</span>
      </a>

      <a routerLink="/map" 
        routerLinkActive="text-[#9fbcff]"
        #mapLink="routerLinkActive"
        [routerLinkActiveOptions]="{exact: true}"
        class="flex flex-col items-center justify-end gap-1 pb-1 text-[#75839d] cursor-pointer" 
        aria-label="Map">
        <span class="grid h-9 w-14 place-items-center rounded-full transition-all duration-200"
              [class.bg-[#2f7dff]]="mapLink.isActive"
              [class.text-white]="mapLink.isActive"
              [class.shadow-[0_0_18px_rgba(47,125,255,0.55)]]="mapLink.isActive">
          <lucide-angular [img]="Map" [size]="16" [strokeWidth]="2"></lucide-angular>
        </span>
        <span class="text-[10px] font-semibold">Map</span>
      </a>
      
    </nav>
  `,
})
export class BottomNavComponent {
  readonly CalendarDays = CalendarDays;
  readonly Cloud = Cloud;
  readonly Map = Map;
}
