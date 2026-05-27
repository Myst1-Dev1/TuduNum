import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

/**
 * Responsabilidade: encapsular tudo relacionado à entidade User.
 *
 * O que é exportado (contrato público mínimo):
 * - UsersService: único ponto de acesso ao dado de usuário para módulos externos.
 *
 * O que NÃO é exportado:
 * - UsersRepository: detalhe de implementação — outros módulos não devem
 *   acessar o banco de dados diretamente, apenas via Service.
 * - User entity: módulos externos recebem o tipo via import direto de TypeScript,
 *   não via injeção de dependência.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
