import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Responsabilidade: validar o Access Token JWT em todas as rotas protegidas.
 *
 * Fluxo:
 * 1. JwtAuthGuard (global) ativa esta strategy em qualquer rota sem @Public().
 * 2. Passport extrai o token do header Authorization: Bearer <token>.
 * 3. Verifica assinatura com JWT_SECRET e expiração automaticamente.
 * 4. validate() recebe o payload decodificado e confirma que o usuário existe.
 * 5. O User retornado popula req.user para uso via @CurrentUser().
 *
 * Nota de extensibilidade:
 * Para suportar múltiplos providers OAuth futuramente, o payload pode incluir
 * um campo "provider" (ex: 'local' | 'google' | 'apple'). A lógica de validate()
 * pode ser adaptada sem breaking changes na interface JwtPayload.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sessão inválida');
    }

    return user;
  }
}
