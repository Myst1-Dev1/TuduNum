import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { ReminderPriority } from './enums/reminder-priority.enum';
import { ReminderStatus } from './enums/reminder-status.enum';
import { RemindersRepository } from './reminders.repository';
import { RemindersService } from './reminders.service';
import { Reminder } from './entities/reminder.entity';

describe('RemindersService', () => {
  let service: RemindersService;
  let repository: jest.Mocked<RemindersRepository>;

  const mockReminderRepository = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findByIdAndUser: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        {
          provide: RemindersRepository,
          useValue: mockReminderRepository,
        },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
    repository = module.get(RemindersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um lembrete com sucesso se a data for no futuro', async () => {
      const userId = 'user-uuid';
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2); // 2 horas no futuro

      const dto: CreateReminderDto = {
        title: 'Estudar NestJS',
        description: 'Focar em Clean Architecture',
        reminderDate: futureDate.toISOString(),
        priority: ReminderPriority.HIGH,
      };

      const createdEntity = {
        id: 'reminder-uuid',
        title: dto.title,
        description: dto.description,
        reminderDate: futureDate,
        priority: dto.priority,
        status: ReminderStatus.PENDING,
        userId,
        notificationSent: false,
        recurrenceRule: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Reminder;

      repository.create.mockResolvedValue(createdEntity);

      const result = await service.create(userId, dto);

      expect(result.id).toBe('reminder-uuid');
      expect(result.title).toBe(dto.title);
      expect(repository.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        reminderDate: expect.any(Date),
        priority: dto.priority,
        recurrenceRule: null,
        userId,
      });
    });

    it('deve lançar BadRequestException se a data for no passado', async () => {
      const userId = 'user-uuid';
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hora no passado

      const dto: CreateReminderDto = {
        title: 'Estudar NestJS',
        reminderDate: pastDate.toISOString(),
      };

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um lembrete se ele existir e pertencer ao usuário', async () => {
      const userId = 'user-uuid';
      const reminderId = 'reminder-uuid';
      const entity = {
        id: reminderId,
        title: 'Teste',
        userId,
      } as Reminder;

      repository.findByIdAndUser.mockResolvedValue(entity);

      const result = await service.findOne(reminderId, userId);

      expect(result.id).toBe(reminderId);
      expect(repository.findByIdAndUser).toHaveBeenCalledWith(reminderId, userId);
    });

    it('deve lançar NotFoundException se o lembrete não existir ou for de outro usuário', async () => {
      repository.findByIdAndUser.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'user-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar o status para COMPLETED e marcar a notificação como enviada', async () => {
      const userId = 'user-uuid';
      const reminderId = 'reminder-uuid';
      const entity = {
        id: reminderId,
        title: 'Lembrete Antigo',
        status: ReminderStatus.PENDING,
        notificationSent: false,
        userId,
      } as Reminder;

      const dto: UpdateReminderDto = {
        status: ReminderStatus.COMPLETED,
      };

      repository.findByIdAndUser.mockResolvedValue(entity);
      repository.save.mockImplementation(async (r) => r);

      const result = await service.update(reminderId, userId, dto);

      expect(result.status).toBe(ReminderStatus.COMPLETED);
      expect(entity.notificationSent).toBe(true);
      expect(repository.save).toHaveBeenCalledWith(entity);
    });

    it('deve lançar BadRequestException se a nova data atualizada for no passado', async () => {
      const userId = 'user-uuid';
      const reminderId = 'reminder-uuid';
      const entity = {
        id: reminderId,
        userId,
      } as Reminder;

      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);

      const dto: UpdateReminderDto = {
        reminderDate: pastDate.toISOString(),
      };

      repository.findByIdAndUser.mockResolvedValue(entity);

      await expect(service.update(reminderId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover logicamente se o registro existir', async () => {
      const userId = 'user-uuid';
      const reminderId = 'reminder-uuid';

      repository.softDelete.mockResolvedValue(true);

      await expect(service.remove(reminderId, userId)).resolves.not.toThrow();
      expect(repository.softDelete).toHaveBeenCalledWith(reminderId, userId);
    });

    it('deve lançar NotFoundException se o registro não for afetado na deleção', async () => {
      repository.softDelete.mockResolvedValue(false);

      await expect(service.remove('invalid-id', 'user-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
