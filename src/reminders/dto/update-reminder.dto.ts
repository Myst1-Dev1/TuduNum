import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ReminderPriority } from '../enums/reminder-priority.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

/**
 * Responsabilidade: validar o payload recebido na atualização parcial de um lembrete.
 * Todos os campos são opcionais por natureza de PATCH.
 */
export class UpdateReminderDto {
  @IsString({ message: 'O título deve ser uma string' })
  @MinLength(1, { message: 'O título não pode ser vazio' })
  @MaxLength(255, { message: 'O título não pode ter mais de 255 caracteres' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'A descrição deve ser uma string' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'A data do lembrete deve ser uma data ISO 8601 válida' })
  @IsOptional()
  reminderDate?: string;

  @IsEnum(ReminderPriority, { message: 'A prioridade fornecida é inválida' })
  @IsOptional()
  priority?: ReminderPriority;

  @IsEnum(ReminderStatus, { message: 'O status fornecido é inválido' })
  @IsOptional()
  status?: ReminderStatus;

  @IsString({ message: 'A regra de recorrência deve ser uma string' })
  @IsOptional()
  @MaxLength(500, { message: 'A regra de recorrência não pode exceder 500 caracteres' })
  recurrenceRule?: string;
}
