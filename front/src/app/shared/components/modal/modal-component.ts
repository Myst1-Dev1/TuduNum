/* eslint-disable @angular-eslint/no-output-native */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateReminderRequest, ReminderPriority } from '@core/models/reminder.model';
import { InputComponent } from '@shared/components/input/input.component';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, LucideAngularModule],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-50 flex items-end justify-center bg-[#030711]/75 px-4 pb-4 pt-10 backdrop-blur-sm sm:items-center sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-reminder-title"
      (click)="close.emit()"
    >
      <section
        class="w-full max-w-[430px] rounded-t-2xl border border-white/10 bg-[#0b1326] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:rounded-2xl"
        (click)="$event.stopPropagation()"
      >
        <header class="mb-5 flex items-start justify-between gap-4">
          <div>
            <p class="text-[9px] font-bold uppercase tracking-wide text-[#8fa0bf]">New reminder</p>
            <h2 id="new-reminder-title" class="mt-1 text-lg font-bold text-slate-50">Create reminder</h2>
          </div>

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full bg-[#121b30] text-[#91a0bd] transition-colors hover:text-white"
            aria-label="Fechar modal"
            (click)="close.emit()"
          >
            <lucide-angular [img]="X" [size]="18" [strokeWidth]="2.2"></lucide-angular>
          </button>
        </header>

        <form class="space-y-4 flex flex-col" [formGroup]="form" (ngSubmit)="submit()">
          <app-input
            label="Title"
            placeholder="Ir ao mercado"
            formControlName="title"
            [error]="fieldError('title')"
          />

          <app-input
            label="Description"
            placeholder="Fazer compras para a semana"
            formControlName="description"
          />

          <app-input
            label="Reminder date"
            type="datetime-local"
            formControlName="reminderDate"
            [error]="fieldError('reminderDate')"
          />

          <div class="flex flex-col gap-1.5">
            <label for="priority" class="text-xs font-bold uppercase tracking-wider text-slate-400">Priority</label>
            <select
              id="priority"
              formControlName="priority"
              class="w-full rounded-xl border border-[#2a2e45] bg-[#1a1d30] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#9fbcff] focus:ring-2 focus:ring-[#9fbcff]/20"
            >
              <option *ngFor="let priority of priorities" [value]="priority">{{ priority }}</option>
            </select>
          </div>

          <app-input
            label="City"
            placeholder="Sao Paulo"
            formControlName="city"
          />

          <p *ngIf="error" class="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200">
            {{ error }}
          </p>

          <p *ngIf="success" class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
            Lembrete criado com sucesso.
          </p>

          <button
            type="submit"
            [disabled]="loading"
            class="flex w-full items-center justify-center rounded-xl bg-[#9fbcff] px-4 py-3 text-sm font-bold text-[#071226] shadow-[0_14px_28px_rgba(22,67,170,0.25)] transition hover:bg-[#b4c9ff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ loading ? 'Criando...' : 'Definir lembrete' }}
          </button>
        </form>
      </section>
    </div>
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() success = false;
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<CreateReminderRequest>();

  readonly X = X;
  readonly priorities = Object.values(ReminderPriority);
  readonly submitted = signal(false);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    reminderDate: ['', Validators.required],
    priority: [ReminderPriority.MEDIUM, Validators.required],
    city: [''],
  });

  submit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.create.emit({
      title: value.title,
      description: value.description || undefined,
      reminderDate: new Date(value.reminderDate).toISOString(),
      priority: value.priority,
      city: value.city || undefined,
    });
  }

  reset(): void {
    this.submitted.set(false);
    this.form.reset({
      title: '',
      description: '',
      reminderDate: '',
      priority: ReminderPriority.MEDIUM,
      city: '',
    });
  }

  fieldError(field: 'title' | 'reminderDate'): string {
    const control = this.form.controls[field];
    const shouldShow = control.invalid && (control.touched || this.submitted());
    return shouldShow ? 'Required field' : '';
  }
}
