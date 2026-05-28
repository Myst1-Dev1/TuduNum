import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ReminderPriority } from '../enums/reminder-priority.enum';

/**
 * Responsabilidade: validar o payload recebido na criação de um lembrete.
 * Assegura que o título não é vazio e que a data possui formato ISO8601 válido.
 */
export class CreateReminderDto {
  @IsString({ message: 'O título deve ser uma string' })
  @MinLength(1, { message: 'O título não pode ser vazio' })
  @MaxLength(255, { message: 'O título não pode ter mais de 255 caracteres' })
  title: string;

  @IsString({ message: 'A descrição deve ser uma string' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'A data do lembrete deve ser uma data ISO 8601 válida' })
  reminderDate: string;

  @IsEnum(ReminderPriority, { message: 'A prioridade fornecida é inválida' })
  @IsOptional()
  priority?: ReminderPriority;

  @IsString({ message: 'A regra de recorrência deve ser uma string' })
  @IsOptional()
  @MaxLength(500, { message: 'A regra de recorrência não pode exceder 500 caracteres' })
  recurrenceRule?: string;
}
