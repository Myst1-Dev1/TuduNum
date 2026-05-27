import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Responsabilidade: validar e tipar o corpo da requisição POST /auth/login.
 * A validação acontece na borda (GlobalValidationPipe no main.ts),
 * antes de chegar à LocalStrategy. Nenhuma lógica de negócio aqui.
 */
export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password: string;
}
