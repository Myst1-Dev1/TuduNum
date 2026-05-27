import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

/**
 * Responsabilidade: expor os endpoints HTTP de autenticação e delegar
 * toda lógica de negócio ao AuthService.
 *
 * Regra: controllers são finos. Aqui só existem:
 * - Extração de dados da requisição (@Body, @CurrentUser)
 * - Delegação ao service
 * - Definição de status HTTP de resposta
 *
 * Throttling:
 * - Login e Register: 5 tentativas/60s (proteção contra brute-force)
 * - Refresh: 20 tentativas/60s (clientes mobile fazem refresh frequente)
 * - Logout: sem limite (idempotente e autenticado)
 *
 * Por que @Public() nos endpoints que têm guard próprio?
 * @Public() bypassa o JwtAuthGuard global. O guard específico
 * (LocalAuthGuard, JwtRefreshGuard) é então ativado pelo @UseGuards().
 * Sem @Public(), o JwtAuthGuard global bloquearia antes do guard correto atuar.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Rota pública. Rate limit restritivo (mesmo que login).
   * Retorna 201 com o par de tokens para login automático pós-registro.
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Rota pública. LocalAuthGuard valida credenciais via LocalStrategy.
   * Se válido, req.user é populado com o User autenticado.
   * 200 em vez de 201 (não cria recurso, apenas autentica).
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@CurrentUser() user: User): Promise<TokenResponseDto> {
    return this.authService.login(user);
  }

  /**
   * POST /auth/refresh
   * Rota pública (tem guard próprio). JwtRefreshGuard valida o refresh token
   * e a correspondência do hash no banco. Emite novo par (rotação single-use).
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@CurrentUser() user: User): Promise<TokenResponseDto> {
    return this.authService.refresh(user);
  }

  /**
   * POST /auth/logout
   * Rota protegida (JwtAuthGuard global atua aqui).
   * Invalida o refreshTokenHash no banco. Idempotente: chamar duas vezes é seguro.
   * 204 No Content: logout bem-sucedido não retorna corpo.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    return this.authService.logout(userId);
  }
}
