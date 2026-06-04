/* eslint-disable @typescript-eslint/no-inferrable-types */
/**
 * RemindersService
 *
 * Responsabilidade: gerenciar reminders através de HTTP e manter estado reativo via Signals.
 *
 * Padrões:
 * - Signals para estado reativo (list, loading, error)
 * - Computed signals para derivações (próximos reminders, reminders do dia, etc)
 * - Métodos para CRUD + filtros avançados
 * - Paginação built-in
 * - Error handling estruturado
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment.prod';
import {
  Reminder,
  CreateReminderRequest,
  UpdateReminderRequest,
  ReminderListResponse,
  ReminderStatus,
  ReminderPriority,
} from '../models/reminder.model';
import { Observable, tap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RemindersService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reminders`;

  /**
   * Estado reativo de reminders
   */
  private _reminders = signal<Reminder[]>([]);
  public reminders = this._reminders.asReadonly();

  /**
   * Estado de paginação
   */
  private _currentPage = signal<number>(1);
  public currentPage = this._currentPage.asReadonly();

  private _totalReminders = signal<number>(0);
  public totalReminders = this._totalReminders.asReadonly();

  private _itemsPerPage = signal<number>(10);
  public itemsPerPage = this._itemsPerPage.asReadonly();

  /**
   * Estado de loading e error
   */
  private _loading = signal<boolean>(false);
  public loading = this._loading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();

  /**
   * Filtros ativos
   */
  private _statusFilter = signal<ReminderStatus | 'ALL'>('ALL');
  public statusFilter = this._statusFilter.asReadonly();

  private _priorityFilter = signal<ReminderPriority | 'ALL'>('ALL');
  public priorityFilter = this._priorityFilter.asReadonly();

  /**
   * Computed signals para derivações
   */
  public filteredReminders = computed(() => {
    const reminders = this._reminders();
    const statusFilter = this._statusFilter();
    const priorityFilter = this._priorityFilter();

    return reminders.filter(r => {
      const statusMatch = statusFilter === 'ALL' || r.status === statusFilter;
      const priorityMatch = priorityFilter === 'ALL' || r.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  });

  /**
   * Próximos 5 reminders ordenados por data
   */
  public upcomingReminders = computed(() => {
    const now = new Date();
    return this.filteredReminders()
      .filter(r => r.status === ReminderStatus.PENDING && new Date(r.reminderDate) >= now)
      .sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime())
      .slice(0, 5);
  });

  /**
   * Reminders do dia
   */
  public todayReminders = computed(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return this.filteredReminders().filter(r => {
      const reminderDate = new Date(r.reminderDate);
      return reminderDate >= startOfDay && reminderDate < endOfDay;
    });
  });

  /**
   * Reminders completados
   */
  public completedReminders = computed(() => {
    return this.filteredReminders().filter(r => r.status === ReminderStatus.COMPLETED);
  });

  /**
   * Total de páginas
   */
  public totalPages = computed(() => {
    return Math.ceil(this._totalReminders() / this._itemsPerPage());
  });

  /**
   * Busca todos os reminders com paginação
   */
  public loadReminders(page: number = 1, limit: number = 10): Observable<ReminderListResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<ReminderListResponse>(this.apiUrl, {
      params: { page: page.toString(), limit: limit.toString() }
    }).pipe(
      tap(response => {
        this._reminders.set(response.data);
        this._currentPage.set(response.page);
        this._totalReminders.set(response.total);
        this._itemsPerPage.set(response.limit);
        this._loading.set(false);
      }),
      catchError(error => {
        const errorMsg = error?.error?.message || 'Erro ao buscar lembretes';
        this._error.set(errorMsg);
        this._loading.set(false);
        console.error('Erro ao carregar reminders:', error);
        throw error;
      })
    );
  }

  /**
   * Busca um reminder específico
   */
  public getReminder(id: string): Observable<Reminder> {
    return this.http.get<Reminder>(`${this.apiUrl}/${id}`).pipe(
      tap(reminder => {
        // Atualiza a lista se o reminder já existe
        const index = this._reminders().findIndex(r => r.id === id);
        if (index !== -1) {
          const updated = [...this._reminders()];
          updated[index] = reminder;
          this._reminders.set(updated);
        }
      }),
      catchError(error => {
        const errorMsg = error?.error?.message || 'Erro ao buscar lembrete';
        this._error.set(errorMsg);
        console.error('Erro ao buscar reminder:', error);
        throw error;
      })
    );
  }

  /**
   * Cria um novo reminder
   */
  public createReminder(request: CreateReminderRequest): Observable<Reminder> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<Reminder>(this.apiUrl, request).pipe(
      tap(reminder => {
        // Adiciona à lista no topo
        this._reminders.set([reminder, ...this._reminders()]);
        this._totalReminders.set(this._totalReminders() + 1);
        this._loading.set(false);
      }),
      catchError(error => {
        const errorMsg = error?.error?.message || 'Erro ao criar lembrete';
        this._error.set(errorMsg);
        this._loading.set(false);
        console.error('Erro ao criar reminder:', error);
        throw error;
      })
    );
  }

  /**
   * Atualiza um reminder existente
   */
  public updateReminder(id: string, request: UpdateReminderRequest): Observable<Reminder> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.patch<Reminder>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedReminder => {
        const index = this._reminders().findIndex(r => r.id === id);
        if (index !== -1) {
          const updated = [...this._reminders()];
          updated[index] = updatedReminder;
          this._reminders.set(updated);
        }
        this._loading.set(false);
      }),
      catchError(error => {
        const errorMsg = error?.error?.message || 'Erro ao atualizar lembrete';
        this._error.set(errorMsg);
        this._loading.set(false);
        console.error('Erro ao atualizar reminder:', error);
        throw error;
      })
    );
  }

  /**
   * Deleta um reminder
   */
  public deleteReminder(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._reminders.set(this._reminders().filter(r => r.id !== id));
        this._totalReminders.set(this._totalReminders() - 1);
        this._loading.set(false);
      }),
      catchError(error => {
        const errorMsg = error?.error?.message || 'Erro ao deletar lembrete';
        this._error.set(errorMsg);
        this._loading.set(false);
        console.error('Erro ao deletar reminder:', error);
        throw error;
      })
    );
  }

  /**
   * Filtra por status
   */
  public setStatusFilter(status: ReminderStatus | 'ALL'): void {
    this._statusFilter.set(status);
  }

  /**
   * Filtra por prioridade
   */
  public setPriorityFilter(priority: ReminderPriority | 'ALL'): void {
    this._priorityFilter.set(priority);
  }

  /**
   * Reseta filtros
   */
  public resetFilters(): void {
    this._statusFilter.set('ALL');
    this._priorityFilter.set('ALL');
  }

  /**
   * Navega para próxima página
   */
  public nextPage(): Observable<ReminderListResponse> {
    const nextPage = Math.min(this._currentPage() + 1, this.totalPages());
    return this.loadReminders(nextPage, this._itemsPerPage());
  }

  /**
   * Navega para página anterior
   */
  public previousPage(): Observable<ReminderListResponse> {
    const prevPage = Math.max(this._currentPage() - 1, 1);
    return this.loadReminders(prevPage, this._itemsPerPage());
  }

  /**
   * Navega para página específica
   */
  public goToPage(page: number): Observable<ReminderListResponse> {
    const validPage = Math.max(1, Math.min(page, this.totalPages()));
    return this.loadReminders(validPage, this._itemsPerPage());
  }

  /**
   * Retorna reminders de um dia específico
   */
  public getRemindersByDate(date: Date): Reminder[] {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return this.reminders().filter(r => {
      const reminderDate = new Date(r.reminderDate);
      return reminderDate >= startOfDay && reminderDate < endOfDay;
    });
  }

  /**
   * Busca reminders por mês
   */
  public getRemindersByMonth(year: number, month: number): Reminder[] {
    return this.reminders().filter(r => {
      const reminderDate = new Date(r.reminderDate);
      return reminderDate.getFullYear() === year && reminderDate.getMonth() === month;
    });
  }

  /**
   * Marca um reminder como completo
   */
  public completeReminder(id: string): Observable<Reminder> {
    return this.updateReminder(id, { status: ReminderStatus.COMPLETED });
  }

  /**
   * Marca um reminder como pendente
   */
  public reopenReminder(id: string): Observable<Reminder> {
    return this.updateReminder(id, { status: ReminderStatus.PENDING });
  }

  /**
   * Arquiva um reminder
   */
  public archiveReminder(id: string): Observable<Reminder> {
    return this.updateReminder(id, { status: ReminderStatus.ARCHIVED });
  }
}
