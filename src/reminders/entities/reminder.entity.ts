import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ReminderPriority } from '../enums/reminder-priority.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

/**
 * Responsabilidade: mapear a tabela 'reminders' no banco de dados.
 *
 * Índices:
 * - idx_reminders_user_status_date: otimiza a query principal do app que lista
 *   reminders ativos/pendentes do usuário logado ordenados por data.
 * - idx_reminders_notification: otimiza buscas síncronas de workers que rodam a cada minuto
 *   para disparar notificações locais/push.
 *
 * Soft Delete:
 * - Habilitado via deletedAt para auditoria e histórico de disparos de notificação.
 */
@Entity('reminders')
@Index('idx_reminders_user_status_date', ['userId', 'status', 'reminderDate'])
@Index('idx_reminders_notification', ['status', 'notificationSent', 'reminderDate'])
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'reminder_date', type: 'timestamp with time zone' })
  reminderDate: Date;

  @Column({
    type: 'enum',
    enum: ReminderPriority,
    default: ReminderPriority.LOW,
  })
  priority: ReminderPriority;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  /**
   * O userId é mapeado explicitamente como uma coluna simples para evitar a necessidade
   * de fazer joins ou carregar o relacionamento User inteiro em queries multi-tenant.
   */
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Controle de agendamento de notificação
  @Column({ name: 'notification_sent', default: false })
  notificationSent: boolean;

  // Regra de recorrência futura (padrão RRULE iCalendar)
  @Column({
    name: 'recurrence_rule',
    type: 'text',
    nullable: true,
  })
  recurrenceRule: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  deletedAt: Date | null;
}
