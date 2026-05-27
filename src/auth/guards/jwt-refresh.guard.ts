import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Responsabilidade: proteger exclusivamente o endpoint POST /auth/refresh.
 * Ativa a JwtRefreshStrategy, que valida o Refresh Token e seu hash no banco.
 * Aplicado junto com @Public() para bypassar o JwtAuthGuard global.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
