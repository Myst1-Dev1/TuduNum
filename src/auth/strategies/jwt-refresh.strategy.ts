import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as crypto from 'crypto';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Responsabilidade: validar o Refresh Token no endpoint POST /auth/refresh.
 *
 * Por que esta strategy existe separada da JwtStrategy?
 * - Usa um secret diferente (JWT_REFRESH_SECRET), essencial para segurança:
 *   um refresh token não pode ser usado como access token nem vice-versa.
 * - Extrai o token do header (Bearer) mas valida o hash no banco.
 * - A validação do hash detecta replay attacks: se o token foi roubado
 *   e o hacker o usou primeiro (gerando rotação), o token original do
 *   usuário legítimo falha no bcrypt.compare → sessão invalidada automaticamente.
 *
 * Fluxo de rotação single-use:
 * 1. Cliente envia refresh token via Authorization: Bearer.
 * 2. Passport verifica assinatura e expiração com JWT_REFRESH_SECRET.
 * 3. validate() busca o usuário com o refreshTokenHash (campo select:false).
 * 4. Compara o token recebido com o hash no banco via bcrypt.compare.
 * 5. Se válido, retorna User → AuthService emite novo par e invalida o atual.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true, // necessário para acessar o token raw no validate()
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<User> {
    // Extrai o token raw do header para comparar com o hash no banco
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente');
    }

    // Carrega o usuário COM o refreshTokenHash (campo select:false)
    const user = await this.usersService.findByIdWithRefreshHash(payload.sub);

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Sessão expirada ou inválida');
    }

    const hashToCompare = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const bufferFromToken = Buffer.from(hashToCompare, 'hex');
    const bufferFromDb = Buffer.from(user.refreshTokenHash, 'hex');

    let tokenMatches =
      bufferFromToken.length === bufferFromDb.length &&
      crypto.timingSafeEqual(bufferFromToken, bufferFromDb);

    // Se o token não bate com o ativo, verifica o anterior dentro do Grace Period (tolerância a concorrência)
    if (!tokenMatches && user.previousRefreshTokenHash && user.sessionRotatedAt) {
      const bufferFromPrevDb = Buffer.from(user.previousRefreshTokenHash, 'hex');
      const matchesPrevious =
        bufferFromToken.length === bufferFromPrevDb.length &&
        crypto.timingSafeEqual(bufferFromToken, bufferFromPrevDb);

      if (matchesPrevious) {
        const rotatedAt = new Date(user.sessionRotatedAt).getTime();
        const now = new Date().getTime();
        const gracePeriodMs = 15000; // 15 segundos de tolerância para requisições paralelas

        if (now - rotatedAt < gracePeriodMs) {
          tokenMatches = true;
        }
      }
    }

    if (!tokenMatches) {
      // Token inválido ou fora do Grace Period → pode indicar replay attack. Invalidar sessão.
      await this.usersService.updateRefreshTokenHash(user.id, null);
      throw new UnauthorizedException(
        'Token de sessão inválido ou expirado. Faça login novamente.',
      );
    }

    return user;
  }
}
