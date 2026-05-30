import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderResponseDto } from './dto/reminder-response.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersService } from './reminders.service';

/**
 * Responsabilidade: expor a API RESTful para gerenciamento de lembretes.
 *
 * Segurança:
 * - Protegido por JwtAuthGuard global automaticamente (não necessita de decorators).
 * - O id do usuário logado é extraído via @CurrentUser('id') e propagado em todas as ações.
 */
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReminderDto,
  ): Promise<ReminderResponseDto> {
    return this.remindersService.create(userId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: ReminderResponseDto[]; total: number; page: number; limit: number }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.remindersService.findAll(userId, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReminderResponseDto> {
    return this.remindersService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderDto,
  ): Promise<ReminderResponseDto> {
    return this.remindersService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.remindersService.remove(id, userId);
  }
}
