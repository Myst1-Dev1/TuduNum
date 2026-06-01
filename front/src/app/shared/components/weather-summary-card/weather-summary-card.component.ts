import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { WeatherService } from '@core/services/weather.service';
import { Cloud, LoaderCircle, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-weather-summary-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <section class="flex items-center justify-between rounded-lg border border-white/5 bg-[#11192d] px-5 py-4">
      <div>
        <p class="text-[9px] font-bold uppercase tracking-wide text-[#8fa0bf]">Clima atual</p>
        <p *ngIf="loading(); else weatherContent" class="mt-1 text-sm font-semibold text-white">
          Carregando clima...
        </p>

        <ng-template #weatherContent>
          <p *ngIf="weather(); else errorContent" class="mt-1 text-sm font-semibold text-white">
            {{ weather()?.temperature }}&deg;C {{ weather()?.condition }}
          </p>
        </ng-template>

        <ng-template #errorContent>
          <p class="mt-1 text-sm font-semibold text-rose-200">
            {{ error() || 'Weather unavailable' }}
          </p>
        </ng-template>

        <p class="mt-0.5 text-[10px] font-semibold text-[#6f7f9b]">{{ city }}</p>
      </div>

      <div class="text-[#a9c2ff] drop-shadow-[0_0_8px_rgba(159,188,255,0.7)]">
        <lucide-angular
          [img]="loading() ? LoaderCircle : Cloud"
          [size]="32"
          [strokeWidth]="2"
          [class.animate-spin]="loading()"
        ></lucide-angular>
      </div>
    </section>
  `,
})
export class WeatherSummaryCardComponent implements OnInit {
  @Input() city = 'Rio de Janeiro';

  private readonly weatherService = inject(WeatherService);

  readonly weather = this.weatherService.weather;
  readonly loading = this.weatherService.loading;
  readonly error = this.weatherService.error;

  readonly Cloud = Cloud;
  readonly LoaderCircle = LoaderCircle;

  ngOnInit(): void {
    this.weatherService.getByCity(this.city).subscribe({
      error: () => {
        // O erro ja fica exposto pelo WeatherService para o template.
      },
    });
  }
}
