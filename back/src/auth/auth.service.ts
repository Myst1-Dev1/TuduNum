import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TokenResponseDto } from './dto/token-response.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** Custo do bcrypt para senhas e refresh token hashes.
 *  12 é o padrão recomendado (OWASP 2024): ~300ms por hash em hardware moderno.
 *  Suficiente para mitigar brute-force sem degradar UX.
 */
const BCRYPT_ROUNDS = 12;

/**
 * Responsabilidade: orquestrar toda a lógica de autenticação.
 *
 * Este service é o único lugar que:
 * - Faz hash de senhas (register)
 * - Gera e assina JWTs (access + refresh)
 * - Faz hash do refresh token e persiste no banco
 * - Invalida a sessão (logout)
 *
 * O que este service NÃO faz:
 * - Não valida credenciais diretamente (delegado à LocalStrategy)
 * - Não extrai tokens de headers (delegado às Strategies)
 * - Não manipula HTTP Request/Response (responsabilidade do Controller)
 *
 * Impacto arquitetural:
 * Se no futuro for necessário suporte a múltiplos providers OAuth,
 * adiciona-se um método `loginWithProvider(providerId, providerData)`
 * que chama `generateAndPersistTokens()` internamente — sem alterar
 * o fluxo de login local.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Registra um novo usuário e retorna o par de tokens imediatamente.
   * Faz hash da senha antes de persistir. A validação de unicidade
   * de e-mail está encapsulada no UsersService (lança ConflictException).
   */
  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    return this.generateAndPersistTokens(user);
  }

  /**
   * Chamado pelo AuthController após a LocalStrategy validar as credenciais.
   * O usuário já está autenticado (req.user populado pelo guard).
   * Apenas gera e persiste o par de tokens.
   */
  async login(user: User): Promise<TokenResponseDto> {
    return this.generateAndPersistTokens(user);
  }

  /**
   * Chamado pelo AuthController após a JwtRefreshStrategy validar o refresh token.
   * Implementa a rotação single-use:
   * - O token antigo já foi validado (hash correspondeu)
   * - Geramos um novo par e sobrescrevemos o hash → token anterior torna-se inválido
   */
  async refresh(user: User): Promise<TokenResponseDto> {
    return this.generateAndPersistTokens(user, true);
  }

  /**
   * Invalida a sessão do usuário zerando o refreshTokenHash.
   * O access token permanece válido até seu TTL (15min).
   * Para revogação imediata de access tokens, uma blacklist Redis seria necessária
   * (fora do escopo da Fase 1 — o TTL curto mitiga o risco).
   */
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshTokenHash(userId, null);
  }

  // ---------------------------------------------------------------------------
  // Métodos privados
  // ---------------------------------------------------------------------------

  /**
   * Gera o par access + refresh token, persiste o hash do refresh no banco
   * e retorna o TokenResponseDto pronto para serialização HTTP.
   *
   * Extraído como método privado para evitar duplicação entre register/login/refresh.
   * Segue a regra de três: usado em 3 lugares → abstração justificada.
   */
  private async generateAndPersistTokens(
    user: User,
    isRotation = false,
  ): Promise<TokenResponseDto> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    if (isRotation && user.refreshTokenHash) {
      await this.usersService.rotateRefreshToken(
        user.id,
        refreshTokenHash,
        user.refreshTokenHash,
      );
    } else {
      await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);
    }

    const expiresIn = Number(
      this.configService.get<string>(
        'JWT_EXPIRES_IN',
        '900',
      ),
    );

    return { accessToken, refreshToken, expiresIn };
  }

  private async generateTokens(
    payload: JwtPayload,
  ): Promise<AuthTokens> {
    const accessTokenExpiresIn = Number(
      this.configService.get<string>(
        'JWT_EXPIRES_IN',
        '900',
      ),
    );

    const refreshTokenExpiresIn = Number(
      this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '604800',
      ),
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>(
          'JWT_SECRET',
        ),
        expiresIn: accessTokenExpiresIn,
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),
        expiresIn: refreshTokenExpiresIn,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
