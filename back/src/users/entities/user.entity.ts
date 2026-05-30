import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Responsabilidade: representar o usuário no banco de dados.
 *
 * Decisões de design:
 * - UUID em vez de ID sequencial: previne enumeração de recursos.
 * - passwordHash e refreshTokenHash: nunca armazenamos dados sensíveis em plain text.
 * - refreshTokenHash com select:false: o hash nunca retorna em queries padrão,
 *   evitando vazamento acidental. É carregado explicitamente apenas nas strategies.
 * - isActive: permite desabilitar contas sem perda de dados (soft-disable).
 *
 * Impacto arquitetural: esta entidade é de propriedade exclusiva do UsersModule.
 * Outros módulos acessam dados de usuário APENAS via UsersService.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  /**
   * Hash bcrypt do refresh token ativo.
   * select: false → TypeORM nunca o inclui em SELECT * automáticos.
   * Carregado explicitamente em JwtRefreshStrategy com addSelect.
   * nullable: true → null significa "sem sessão ativa" (estado pós-logout).
   */
  @Column({
    name: 'refresh_token_hash',
    type: 'text',
    nullable: true,
    select: false,
  })
  refreshTokenHash: string | null;

  @Column({
    name: 'previous_refresh_token_hash',
    type: 'text',
    nullable: true,
    select: false,
  })
  previousRefreshTokenHash: string | null;

  @Column({
    name: 'session_rotated_at',
    type: 'timestamp',
    nullable: true,
    select: false,
  })
  sessionRotatedAt: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
