import { SetMetadata } from '@nestjs/common';

/**
 * Responsabilidade: marcar uma rota como pública, sinalizando ao
 * JwtAuthGuard (global) que deve pular a validação de token.
 *
 * Padrão "secure by default":
 * Qualquer nova rota é protegida automaticamente pelo guard global.
 * O desenvolvedor precisa optar explicitamente por torná-la pública
 * usando este decorator. Esquecer @Public() em uma rota privada é seguro;
 * esquecer @UseGuards(JwtAuthGuard) em uma rota protegida seria um bug de segurança.
 *
 * Uso:
 * @Public()
 * @Post('login')
 * login() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
