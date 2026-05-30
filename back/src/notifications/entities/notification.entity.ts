import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationType } from '../enums/notification-type.enum';

@Entity('notifications')
@Index('idx_notifications_user_read', ['userId', 'read'])
@Index('idx_notifications_user_created', ['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  sent: boolean;

  @Column({ name: 'reminder_id', type: 'uuid', nullable: true })
  reminderId: string | null;

  @Column({ name: 'read_at', type: 'timestamp with time zone', nullable: true })
  readAt: Date | null;

  @Column({ name: 'sent_at', type: 'timestamp with time zone', nullable: true })
  sentAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
