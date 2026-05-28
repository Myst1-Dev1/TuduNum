import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderResponseDto } from './dto/reminder-response.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderStatus } from './enums/reminder-status.enum';
import { RemindersRepository } from './reminders.repository';

@Injectable()
export class RemindersService {
  constructor(private readonly remindersRepository: RemindersRepository) {}

  /**
   * Cria um novo lembrete contendo regras de validação temporais.
   *
   * Regra de Negócio:
   * - A data do lembrete deve estar no futuro.
   */
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
      recurrenceRule: dto.recurrenceRule ?? null,
      userId,
    });

    return ReminderResponseDto.fromEntity(reminder);
  }

  /**
   * Lista os lembretes do usuário logado de forma paginada.
   */
  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: ReminderResponseDto[]; total: number; page: number; limit: number }> {
    const parsedPage = Math.max(1, page);
    const parsedLimit = Math.max(1, Math.min(100, limit)); // caps limit at 100 for safety
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

  /**
   * Retorna um lembrete específico após validar o isolamento por usuário.
   */
  async findOne(id: string, userId: string): Promise<ReminderResponseDto> {
    const reminder = await this.remindersRepository.findByIdAndUser(id, userId);

    if (!reminder) {
      throw new NotFoundException('Lembrete não encontrado');
    }

    return ReminderResponseDto.fromEntity(reminder);
  }

  /**
   * Atualiza as informações do lembrete do usuário de forma parcial.
   *
   * Regras de Negócio:
   * - Se a data for alterada, ela deve estar no futuro.
   * - Se o status for alterado para concluído (COMPLETED) ou arquivado (ARCHIVED),
   *   a notificação correspondente é considerada enviada (anulando o envio futuro).
   * - Se a data for atualizada e o status for redefinido para PENDING,
   *   reseta a flag 'notificationSent' para permitir novo envio.
   */
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

    if (dto.recurrenceRule !== undefined) {
      reminder.recurrenceRule = dto.recurrenceRule ?? null;
    }

    // Validação de mudança de data
    if (dto.reminderDate !== undefined) {
      const newDate = new Date(dto.reminderDate);
      const now = new Date();

      if (newDate <= now) {
        throw new BadRequestException(
          'A nova data do lembrete deve ser definida no futuro.',
        );
      }

      reminder.reminderDate = newDate;

      // Se a data mudou e o status for pendente, reativa a notificação para a nova data
      if (reminder.status === ReminderStatus.PENDING) {
        reminder.notificationSent = false;
      }
    }

    // Regra de conclusão de notificação baseada em status
    if (dto.status !== undefined) {
      reminder.status = dto.status;

      if (
        dto.status === ReminderStatus.COMPLETED ||
        dto.status === ReminderStatus.ARCHIVED
      ) {
        reminder.notificationSent = true;
      } else if (dto.status === ReminderStatus.PENDING) {
        // Se voltou a ser pendente, reseta para enviar notificação (se data estiver no futuro)
        const now = new Date();
        reminder.notificationSent = reminder.reminderDate <= now;
      }
    }

    const updatedReminder = await this.remindersRepository.save(reminder);
    return ReminderResponseDto.fromEntity(updatedReminder);
  }

  /**
   * Deleta logicamente um lembrete do usuário autenticado.
   */
  async remove(id: string, userId: string): Promise<void> {
    const deleted = await this.remindersRepository.softDelete(id, userId);

    if (!deleted) {
      throw new NotFoundException('Lembrete não encontrado');
    }
  }
}
