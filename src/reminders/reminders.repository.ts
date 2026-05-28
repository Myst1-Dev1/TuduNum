import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './entities/reminder.entity';

/**
 * Responsabilidade: encapsular todo o acesso ao banco de dados para a tabela 'reminders'.
 *
 * Garante o isolamento multi-tenant exigindo o userId em todas as queries
 * de leitura, escrita e deleção (prevenção contra IDOR).
 */
@Injectable()
export class RemindersRepository {
  constructor(
    @InjectRepository(Reminder)
    private readonly repo: Repository<Reminder>,
  ) {}

  /**
   * Lista lembretes com paginação simples baseada em skip/take.
   * Filtra pelo usuário logado e ordena por data decrescente de lembrete.
   */
  async findAllByUser(
    userId: string,
    skip: number,
    take: number,
  ): Promise<[Reminder[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      order: { reminderDate: 'ASC' },
      skip,
      take,
    });
  }

  /**
   * Busca um lembrete específico assegurando o isolamento de tenant.
   */
  async findByIdAndUser(id: string, userId: string): Promise<Reminder | null> {
    return this.repo.findOne({
      where: { id, userId },
    });
  }

  /**
   * Cria a instância do lembrete, preenchendo as colunas padrões.
   */
  async create(data: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.repo.create(data);
    return this.repo.save(reminder);
  }

  /**
   * Salva as alterações da entidade no banco.
   */
  async save(reminder: Reminder): Promise<Reminder> {
    return this.repo.save(reminder);
  }

  /**
   * Executa a deleção lógica (soft delete) da entidade.
   * A cláusula where garante que apenas lembretes do usuário sejam deletados.
   */
  async softDelete(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.softDelete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
