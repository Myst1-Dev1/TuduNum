/**
 * Modelos de Reminders
 *
 * Responsabilidade: definir a interface de contrato entre frontend e API backend.
 * Garante tipagem forte e reusabilidade em toda a aplicação.
 */

/**
 * Enums devem estar sincronizados com backend
 */
export enum ReminderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Modelo completo de Reminder retornado pela API
 */
export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminderDate: Date;
  priority: ReminderPriority;
  status: ReminderStatus;
  city: string | null;
  recurrenceRule: string | null;
  notificationSent: boolean;
  weatherChecked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request para criar um novo reminder
 */
export interface CreateReminderRequest {
  title: string;
  description?: string;
  reminderDate: string; // ISO 8601
  priority?: ReminderPriority;
  city?: string;
  recurrenceRule?: string;
}

/**
 * Request para atualizar um reminder
 */
export interface UpdateReminderRequest {
  title?: string;
  description?: string;
  reminderDate?: string; // ISO 8601
  priority?: ReminderPriority;
  status?: ReminderStatus;
  city?: string;
  recurrenceRule?: string;
}

/**
 * Response de listagem com paginação
 */
export interface ReminderListResponse {
  data: Reminder[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Enumeração de filtros de status para o calendário
 */
export type ReminderFilterStatus = ReminderStatus | 'ALL';

/**
 * Enumeração de filtros de prioridade
 */
export type ReminderFilterPriority = ReminderPriority | 'ALL';
