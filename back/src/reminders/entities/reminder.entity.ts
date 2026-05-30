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

@Entity('reminders')
@Index('idx_reminders_user_status_date', ['userId', 'status', 'reminderDate'])
@Index('idx_reminders_notification', ['status', 'notificationSent', 'reminderDate'])
@Index('idx_reminders_weather', ['status', 'weatherChecked', 'reminderDate'])
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

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'notification_sent', default: false })
  notificationSent: boolean;

  @Column({ name: 'weather_checked', default: false })
  weatherChecked: boolean;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  city: string | null;

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
