import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

/**
 * Responsabilidade: encapsular toda a lógica de negócio relacionada ao
 * ciclo de vida do usuário (criação, leitura, atualização de sessão).
 *
 * Contrato público (o que AuthModule pode usar):
 * - findByEmail      → login
 * - findById         → guards e refresh
 * - findByIdWithRefreshHash → JwtRefreshStrategy
 * - create           → registro
 * - updateRefreshTokenHash → rotação de tokens e logout
 * - existsByEmail    → validação de unicidade antes de criar
 *
 * O que este Service NÃO faz:
 * - Não gera tokens JWT (responsabilidade do AuthService)
 * - Não faz hash de senhas (responsabilidade do AuthService)
 * Isso evita acoplamento bidirecional entre os módulos.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário não encontrado`);
    }
    return user;
  }

  async findByIdWithRefreshHash(id: string): Promise<User | null> {
    return this.usersRepository.findByIdWithRefreshHash(id);
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User> {
    const emailTaken = await this.usersRepository.existsByEmail(data.email);
    if (emailTaken) {
      // Mensagem genérica intencional: não revela se o e-mail existe (OWASP)
      throw new ConflictException('E-mail já cadastrado');
    }
    return this.usersRepository.create(data);
  }

  async updateRefreshTokenHash(
    userId: string,
    hash: string | null,
  ): Promise<void> {
    return this.usersRepository.updateRefreshTokenHash(userId, hash);
  }

  async rotateRefreshToken(
    userId: string,
    newHash: string,
    oldHash: string,
  ): Promise<void> {
    return this.usersRepository.rotateRefreshToken(userId, newHash, oldHash);
  }
}
