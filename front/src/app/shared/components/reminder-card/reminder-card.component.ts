import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Reminder, ReminderPriority, ReminderStatus } from '@core/models/reminder.model';
import { Dumbbell, LucideAngularModule, Mic, RadioTower } from 'lucide-angular';

@Component({
  selector: 'app-reminder-card',
  standalone: true,
  imports: [CommonModule, DatePipe, LucideAngularModule],
  template: `
    <article class="flex items-center gap-4 rounded-lg border border-white/5 bg-[#121b30] p-3 shadow-[0_10px_22px_rgba(0,0,0,0.12)]">
      <div class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#26386c] text-[#9fbcff]">
        <lucide-angular [img]="icon" [size]="17" [strokeWidth]="2"></lucide-angular>
      </div>

      <div class="min-w-0">
        <p class="text-[9px] font-bold uppercase tracking-wide text-[#8796b3]">
          {{ reminder.reminderDate | date: 'hh:mm a' }}
        </p>
        <h3 class="truncate text-xs font-semibold text-white">{{ reminder.title }}</h3>
      </div>
    </article>
  `,
})
export class ReminderCardComponent {
  @Input({ required: true }) reminder!: Reminder;
  @Output() edit = new EventEmitter<Reminder>();
  @Output() complete = new EventEmitter<string>();
  @Output() reopen = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  readonly ReminderStatus = ReminderStatus;

  get icon() {
    const title = this.reminder.title.toLowerCase();

    if (title.includes('gym')) {
      return Dumbbell;
    }

    if (title.includes('standup')) {
      return Mic;
    }

    return RadioTower;
  }

  getStatusLabel(status: ReminderStatus): string {
    const labels = {
      PENDING: 'Pendente',
      COMPLETED: 'Concluido',
      ARCHIVED: 'Arquivado',
    };
    return labels[status];
  }

  getPriorityLabel(priority: ReminderPriority): string {
    const labels = {
      LOW: 'Baixa',
      MEDIUM: 'Media',
      HIGH: 'Alta',
    };
    return labels[priority];
  }
}
