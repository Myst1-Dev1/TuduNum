import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Responsabilidade: ativar a LocalStrategy no endpoint POST /auth/login.
 *
 * Este guard é aplicado APENAS no método login() do AuthController.
 * Ele delega toda a validação de credenciais para LocalStrategy,
 * mantendo o controller livre de lógica de autenticação.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
