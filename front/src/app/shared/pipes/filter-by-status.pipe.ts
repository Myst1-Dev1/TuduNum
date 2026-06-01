/**
 * FilterByStatusPipe
 *
 * Responsabilidade: filtrar reminders por status dentro do template
 */

import { Pipe, PipeTransform } from '@angular/core';
import { Reminder, ReminderStatus } from '@core/models/reminder.model';

@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(reminders: Reminder[], status: ReminderStatus): number {
    return reminders.filter(r => r.status === status).length;
  }
}
