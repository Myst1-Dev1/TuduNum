import { Reminder } from '../entities/reminder.entity';
import { ReminderPriority } from '../enums/reminder-priority.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

/**
 * Responsabilidade: definir o contrato de saída de dados de um lembrete.
 *
 * Utiliza o padrão de mapeamento explícito via método estático 'fromEntity'.
 * Isso evita o uso de serialização baseada em reflexão (class-transformer),
 * que é mais lenta e adiciona sobrecarga em tempo de execução.
 */
export class ReminderResponseDto {
  id: string;
  title: string;
  description: string | null;
  reminderDate: Date;
  priority: ReminderPriority;
  status: ReminderStatus;
  recurrenceRule: string | null;
  createdAt: Date;

  static fromEntity(reminder: Reminder): ReminderResponseDto {
    return {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      reminderDate: reminder.reminderDate,
      priority: reminder.priority,
      status: reminder.status,
      recurrenceRule: reminder.recurrenceRule,
      createdAt: reminder.createdAt,
    };
  }
}
