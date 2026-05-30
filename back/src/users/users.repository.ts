import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/**
 * Responsabilidade: isolar o acesso ao banco de dados para a entidade User.
 *
 * Por que este arquivo existe?
 * Seguindo o Repository Pattern, o UsersService nunca chama o EntityManager
 * ou o DataSource diretamente. Toda query custom fica aqui, mantendo o Service
 * livre de detalhes de persistência. Facilita mocking em testes unitários.
 *
 * Impacto arquitetural: qualquer mudança de ORM (ex: Prisma) afeta apenas
 * esta classe, não o Service.
 */
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Carrega o refreshTokenHash explicitamente (coluna com select:false).
   * Usado exclusivamente pela JwtRefreshStrategy para validar o token.
   */
  async findByIdWithRefreshHash(id: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .addSelect([
        'user.refresh_token_hash',
        'user.previous_refresh_token_hash',
        'user.session_rotated_at',
      ])
      .where('user.id = :id', { id })
      .getOne();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async updateRefreshTokenHash(
    userId: string,
    hash: string | null,
  ): Promise<void> {
    await this.repo.update(userId, {
      refreshTokenHash: hash,
      previousRefreshTokenHash: null,
      sessionRotatedAt: null,
    });
  }

  async rotateRefreshToken(
    userId: string,
    newHash: string,
    oldHash: string,
  ): Promise<void> {
    await this.repo.update(userId, {
      refreshTokenHash: newHash,
      previousRefreshTokenHash: oldHash,
      sessionRotatedAt: new Date(),
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.existsBy({ email });
  }
}
