import { Reminder } from '../entities/reminder.entity';
import { ReminderPriority } from '../enums/reminder-priority.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

export class ReminderResponseDto {
  id: string;
  title: string;
  description: string | null;
  reminderDate: Date;
  priority: ReminderPriority;
  status: ReminderStatus;
  recurrenceRule: string | null;
  city: string | null;
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
      city: reminder.city,
      createdAt: reminder.createdAt,
    };
  }
}
