import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Responsabilidade: extrair o usuário autenticado do Request de forma tipada.
 *
 * O JwtAuthGuard (via JwtStrategy.validate) popula req.user com o objeto User.
 * Este decorator elimina o acesso direto ao objeto Request nos controllers,
 * reduzindo o acoplamento ao framework HTTP e tornando as assinaturas mais expressivas.
 *
 * Uso sem propriedade específica:
 * @CurrentUser() user: User  → retorna o objeto User completo
 *
 * Uso com propriedade:
 * @CurrentUser('id') userId: string  → retorna apenas user.id
 */
export const CurrentUser = createParamDecorator(
  (property: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    const user = request.user;
    return property ? user?.[property] : user;
  },
);
