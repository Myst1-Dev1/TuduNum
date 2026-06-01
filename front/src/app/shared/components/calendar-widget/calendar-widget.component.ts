import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Reminder } from '@core/models/reminder.model';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <section class="rounded-lg border border-white/5 bg-[#11192d] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.18)]">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-100">{{ monthLabel }}</h3>

        <div class="flex items-center gap-2">
          <button
            (click)="previousMonth()"
            class="grid h-7 w-7 place-items-center rounded-full bg-[#1b2740] text-slate-400 transition-colors hover:bg-[#243554] hover:text-white"
            aria-label="Mes anterior"
          >
            <lucide-angular [img]="ChevronLeft" [size]="14" [strokeWidth]="2.4"></lucide-angular>
          </button>

          <button
            (click)="nextMonth()"
            class="grid h-7 w-7 place-items-center rounded-full bg-[#1b2740] text-slate-400 transition-colors hover:bg-[#243554] hover:text-white"
            aria-label="Proximo mes"
          >
            <lucide-angular [img]="ChevronRight" [size]="14" [strokeWidth]="2.4"></lucide-angular>
          </button>
        </div>
      </div>

      <div class="mb-2 grid grid-cols-7 gap-1">
        <div *ngFor="let day of weekDays" class="py-1 text-center text-[10px] font-bold uppercase text-slate-500">
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <ng-container *ngFor="let date of calendarDays">
          <button
            *ngIf="date"
            (click)="selectDate(date)"
            [disabled]="!isClickable(date)"
            class="relative m-auto w-5 h-5 aspect-square rounded-full text-[11px] font-medium transition-all"
            [ngClass]="{
              'text-slate-600': !isCurrentMonth(date),
              'text-slate-300 hover:bg-[#1b2740]': isCurrentMonth(date) && !isSelected(date),
              'bg-[#9fbcff] text-[#0a1428] shadow-[0_0_18px_rgba(159,188,255,0.55)]': isSelected(date),
              'cursor-not-allowed': !isClickable(date),
              'cursor-pointer': isClickable(date)
            }"
          >
            {{ date.getDate() }}

            <span
              *ngIf="hasReminders(date)"
              class="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#9fbcff]"
              [title]="getReminderCountForDate(date) + ' lembrete(s)'"
            ></span>
          </button>

          <div *ngIf="!date" class="aspect-square"></div>
        </ng-container>
      </div>
    </section>
  `,
})
export class CalendarWidgetComponent implements OnInit {
  @Input() reminders: Reminder[] = [];
  @Input() initialDate = new Date(2024, 8, 1);
  @Input() initialSelectedDate: Date | null = new Date(2024, 8, 4);
  @Output() dateSelected = new EventEmitter<Date>();

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  currentDate = new Date(2024, 8, 1);
  selectedDate: Date | null = new Date(2024, 8, 4);
  calendarDays: Date[] = [];

  ngOnInit(): void {
    this.currentDate = new Date(this.initialDate);
    this.selectedDate = this.initialSelectedDate ? new Date(this.initialSelectedDate) : null;
    this.generateCalendar();
  }

  get monthLabel(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const mondayOffset = (firstDay.getDay() + 6) % 7;

    startDate.setDate(startDate.getDate() - mondayOffset);
    this.calendarDays = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + index);
      return date;
    });
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(date: Date): void {
    if (!this.isClickable(date)) {
      return;
    }

    this.selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.dateSelected.emit(this.selectedDate);
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  isSelected(date: Date): boolean {
    return this.selectedDate?.toDateString() === date.toDateString();
  }

  isClickable(date: Date): boolean {
    return this.isCurrentMonth(date);
  }

  hasReminders(date: Date): boolean {
    return this.getReminderCountForDate(date) > 0;
  }

  getReminderCountForDate(date: Date): number {
    return this.reminders.filter((reminder) => {
      const reminderDate = new Date(reminder.reminderDate);
      return reminderDate.toDateString() === date.toDateString();
    }).length;
  }
}
