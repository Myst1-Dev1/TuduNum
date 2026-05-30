import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

/**
 * Responsabilidade: validar credenciais e-mail + senha no endpoint POST /auth/login.
 *
 * Fluxo:
 * 1. LocalAuthGuard ativa esta strategy.
 * 2. Passport extrai { username, password } do corpo da requisição.
 *    Mapeamos "username" → "email" via usernameField.
 * 3. validate() busca o usuário e compara o hash com bcrypt.
 * 4. Retorna o User (sem passwordHash) → Passport popula req.user.
 * 5. AuthController.login() recebe req.user via @CurrentUser().
 *
 * Segurança — resposta genérica:
 * Tanto "usuário não encontrado" quanto "senha incorreta" retornam
 * o mesmo 401 genérico. Isso previne enumeração de e-mails (OWASP A07).
 *
 * Extensibilidade futura (OAuth):
 * Esta strategy é responsável APENAS pelo provider local (e-mail + senha).
 * Novos providers (Google, Apple) serão adicionados como novas strategies
 * em arquivos separados (google.strategy.ts, apple.strategy.ts),
 * sem alterar esta classe.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly usersService: UsersService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    // Mensagem genérica — não revela se o e-mail existe ou se a senha está errada
    const invalidCredentials = new UnauthorizedException('Credenciais inválidas');

    if (!user || !user.isActive) {
      throw invalidCredentials;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials;
    }

    // Removemos o hash da senha antes de popular req.user
    const { passwordHash: _ph, ...safeUser } = user;
    return safeUser as User;
  }
}
