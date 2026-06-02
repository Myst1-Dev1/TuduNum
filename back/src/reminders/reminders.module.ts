import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './entities/reminder.entity';
import { RemindersController } from './reminders.controller';
import { RemindersRepository } from './reminders.repository';
import { RemindersService } from './reminders.service';
import { ReminderNotificationsScheduler } from './reminder-notifications.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * Responsabilidade: modularizar e encapsular todas as dependências de reminders.
 *
 * Registra a entidade Reminder no TypeOrmModule, expondo a injeção do Repository.
 * Não exporta nenhum provider, seguindo o princípio do menor privilégio.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Reminder]), NotificationsModule],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersRepository, ReminderNotificationsScheduler],
  exports: [RemindersService],
})
export class RemindersModule {}
