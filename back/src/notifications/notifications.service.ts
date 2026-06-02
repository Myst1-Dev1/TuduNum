import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsRepository } from './notifications.repository';
import { NotificationDispatchService } from './dispatch/notification-dispatch.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly dispatchService: NotificationDispatchService,
  ) {}

  async create(
    userId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsRepository.create({
      userId,
      type: dto.type,
      title: dto.title,
      message: dto.message ?? null,
      reminderId: dto.reminderId ?? null,
    });

    // Dispatch asynchronously; creation is the source of truth.
    this.dispatchService.dispatch(notification).catch(() => {});

    return NotificationResponseDto.fromEntity(notification);
  }

  async findAll(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
    unreadCount: number;
  }> {
    const parsedPage = Math.max(1, page);
    const parsedLimit = Math.max(1, Math.min(100, limit));
    const skip = (parsedPage - 1) * parsedLimit;

    const [notifications, total] =
      await this.notificationsRepository.findAllByUser(
        userId,
        skip,
        parsedLimit,
      );

    const unreadCount =
      await this.notificationsRepository.countUnreadByUser(userId);

    return {
      data: notifications.map((n) => NotificationResponseDto.fromEntity(n)),
      total,
      page: parsedPage,
      limit: parsedLimit,
      unreadCount,
    };
  }

  async findOne(id: string, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationsRepository.findByIdAndUser(
      id,
      userId,
    );

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return NotificationResponseDto.fromEntity(notification);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsRepository.findByIdAndUser(
      id,
      userId,
    );

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    if (dto.read !== undefined) {
      notification.read = dto.read;
      notification.readAt = dto.read ? new Date() : null;
    }

    const updated = await this.notificationsRepository.save(notification);
    return NotificationResponseDto.fromEntity(updated);
  }

  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    return this.update(id, userId, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllAsReadByUser(userId);
  }
}
