/**
 * ReminderFormComponent
 *
 * Responsabilidade: renderizar formulário para criar/editar reminders.
 *
 * Padrões:
 * - Standalone component
 * - Template-driven forms com validações reativas
 * - Tipagem forte
 * - Estados de loading
 * - Output eventos para ações
 */

import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Reminder,
  CreateReminderRequest,
  UpdateReminderRequest,
  ReminderPriority,
  ReminderStatus,
} from '@core/models/reminder.model';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-4 p-4 bg-white dark:bg-dark-card rounded-lg border border-slate-200 dark:border-dark-border">
      <!-- Título -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Título <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          [(ngModel)]="form.title"
          name="title"
          placeholder="Ex: Estudar Angular"
          required
          [disabled]="isLoading"
          class="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md dark:bg-dark-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <!-- Descrição -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Descrição (opcional)
        </label>
        <textarea
          [(ngModel)]="form.description"
          name="description"
          placeholder="Adicione mais detalhes..."
          [disabled]="isLoading"
          rows="3"
          class="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md dark:bg-dark-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
        ></textarea>
      </div>

      <!-- Data e Hora -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Data e Hora <span class="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          [(ngModel)]="dateTimeValue"
          name="reminderDate"
          required
          [disabled]="isLoading"
          class="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md dark:bg-dark-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <!-- Prioridade -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Prioridade
        </label>
        <select
          [(ngModel)]="form.priority"
          name="priority"
          [disabled]="isLoading"
          class="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md dark:bg-dark-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="LOW">Baixa</option>
          <option value="MEDIUM">Média</option>
          <option value="HIGH">Alta</option>
        </select>
      </div>

      <!-- Cidade (para integração com clima) -->
      <div>
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Cidade (opcional - para alertas de clima)
        </label>
        <input
          type="text"
          [(ngModel)]="form.city"
          name="city"
          placeholder="Ex: São Paulo"
          [disabled]="isLoading"
          class="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md dark:bg-dark-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <!-- Status (apenas se editando) -->
      <div *ngIf="isEditing">
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Status
        </label>
        <select
          [(ngModel)]="form.status"
          name="status"
          [disabled]="isLoading"
          class="w-full px-3 py-2 border border-slate-300 dark:border-dark-border rounded-md dark:bg-dark-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="PENDING">Pendente</option>
          <option value="COMPLETED">Completo</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </div>

      <!-- Mensagens de erro -->
      <div *ngIf="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-md text-red-700 dark:text-red-400 text-sm">
        {{ error }}
      </div>

      <!-- Botões de ação -->
      <div class="flex gap-2 justify-end pt-2">
        <button
          type="button"
          (click)="onCancel()"
          [disabled]="isLoading"
          class="px-4 py-2 border border-slate-300 dark:border-dark-border rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-surface disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          [disabled]="isLoading || !form.title || !dateTimeValue"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md disabled:opacity-50 transition-colors font-semibold"
        >
          {{ isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar') }}
        </button>
      </div>
    </form>
  `,
  styles: []
})
export class ReminderFormComponent implements OnInit {
  @Input() reminder: Reminder | null = null;
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Output() submitted = new EventEmitter<CreateReminderRequest | UpdateReminderRequest>();
  @Output() cancelled = new EventEmitter<void>();

  form = {
    title: '',
    description: undefined as string | undefined,
    priority: ReminderPriority.MEDIUM as ReminderPriority,
    city: undefined as string | undefined,
    status: ReminderStatus.PENDING as ReminderStatus,
  };

  dateTimeValue = '';
  isEditing = false;

  ngOnInit(): void {
    if (this.reminder) {
      this.isEditing = true;
      this.form = {
        title: this.reminder.title,
        description: this.reminder.description || undefined,
        priority: this.reminder.priority,
        city: this.reminder.city || undefined,
        status: this.reminder.status,
      };
      // Converter Date para ISO string para datetime-local
      const date = new Date(this.reminder.reminderDate);
      this.dateTimeValue = this.formatDateTimeLocal(date);
    }
  }

  onSubmit(): void {
    if (!this.form.title || !this.dateTimeValue) return;

    const reminderDate = new Date(this.dateTimeValue).toISOString();

    const payload: CreateReminderRequest | UpdateReminderRequest = {
      title: this.form.title,
      ...(this.form.description && { description: this.form.description }),
      reminderDate,
      priority: this.form.priority,
      ...(this.form.city && { city: this.form.city }),
      ...(this.isEditing && { status: this.form.status }),
    };

    this.submitted.emit(payload);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
