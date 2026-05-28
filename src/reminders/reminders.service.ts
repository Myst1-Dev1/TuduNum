import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { ReminderResponseDto } from './dto/reminder-response.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderStatus } from './enums/reminder-status.enum';
import { RemindersRepository } from './reminders.repository';

@Injectable()
export class RemindersService {
  constructor(private readonly remindersRepository: RemindersRepository) {}

  async create(
    userId: string,
    dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    const reminderDate = new Date(dto.reminderDate);
    const now = new Date();

    if (reminderDate <= now) {
      throw new BadRequestException(
        'A data do lembrete deve ser definida no futuro.',
      );
    }

    const reminder = await this.remindersRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      reminderDate,
      priority: dto.priority,
      city: dto.city ?? null,
      recurrenceRule: dto.recurrenceRule ?? null,
      userId,
    });

    return ReminderResponseDto.fromEntity(reminder);
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: ReminderResponseDto[]; total: number; page: number; limit: number }> {
    const parsedPage = Math.max(1, page);
    const parsedLimit = Math.max(1, Math.min(100, limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const [reminders, total] = await this.remindersRepository.findAllByUser(
      userId,
      skip,
      parsedLimit,
    );

    return {
      data: reminders.map((r) => ReminderResponseDto.fromEntity(r)),
      total,
      page: parsedPage,
      limit: parsedLimit,
    };
  }

  async findOne(id: string, userId: string): Promise<ReminderResponseDto> {
    const reminder = await this.remindersRepository.findByIdAndUser(id, userId);

    if (!reminder) {
      throw new NotFoundException('Lembrete não encontrado');
    }

    return ReminderResponseDto.fromEntity(reminder);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateReminderDto,
  ): Promise<ReminderResponseDto> {
    const reminder = await this.remindersRepository.findByIdAndUser(id, userId);

    if (!reminder) {
      throw new NotFoundException('Lembrete não encontrado');
    }

    if (dto.title !== undefined) {
      reminder.title = dto.title;
    }

    if (dto.description !== undefined) {
      reminder.description = dto.description ?? null;
    }

    if (dto.priority !== undefined) {
      reminder.priority = dto.priority;
    }

    if (dto.city !== undefined) {
      reminder.city = dto.city ?? null;
      reminder.weatherChecked = false;
    }

    if (dto.recurrenceRule !== undefined) {
      reminder.recurrenceRule = dto.recurrenceRule ?? null;
    }

    if (dto.reminderDate !== undefined) {
      const newDate = new Date(dto.reminderDate);
      const now = new Date();

      if (newDate <= now) {
        throw new BadRequestException(
          'A nova data do lembrete deve ser definida no futuro.',
        );
      }

      reminder.reminderDate = newDate;

      if (reminder.status === ReminderStatus.PENDING) {
        reminder.notificationSent = false;
        reminder.weatherChecked = false;
      }
    }

    if (dto.status !== undefined) {
      reminder.status = dto.status;

      if (
        dto.status === ReminderStatus.COMPLETED ||
        dto.status === ReminderStatus.ARCHIVED
      ) {
        reminder.notificationSent = true;
      } else if (dto.status === ReminderStatus.PENDING) {
        const now = new Date();
        reminder.notificationSent = reminder.reminderDate <= now;
        reminder.weatherChecked = reminder.reminderDate <= now;
      }
    }

    const updatedReminder = await this.remindersRepository.save(reminder);
    return ReminderResponseDto.fromEntity(updatedReminder);
  }

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.remindersRepository.softDelete(id, userId);

    if (!deleted) {
      throw new NotFoundException('Lembrete não encontrado');
    }
  }

  async findPendingWeatherAlerts(horizonHours = 6): Promise<Reminder[]> {
    return this.remindersRepository.findPendingWeatherAlerts(
      new Date(),
      horizonHours,
    );
  }

  async markWeatherAlertSent(id: string): Promise<void> {
    await this.remindersRepository.markWeatherChecked(id);
  }
}
