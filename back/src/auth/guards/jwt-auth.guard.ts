import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Responsabilidade: proteger todas as rotas da aplicação por padrão,
 * permitindo opt-out explícito via decorator @Public().
 *
 * Este guard é registrado GLOBALMENTE no AppModule (APP_GUARD).
 * Isso implementa o padrão "secure by default":
 * - Nova rota sem @Public() → protegida automaticamente.
 * - Nova rota com @Public() → acessível sem token (ex: login, register).
 *
 * Fluxo:
 * 1. Reflector verifica se a rota tem metadata 'isPublic'.
 * 2. Se sim → retorna true (bypass do guard).
 * 3. Se não → delega para JwtStrategy (valida Bearer token).
 *
 * Extensibilidade futura:
 * Quando OAuth for implementado, este guard pode ser estendido para
 * aceitar tokens de múltiplos providers sem quebrar o contrato atual.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
