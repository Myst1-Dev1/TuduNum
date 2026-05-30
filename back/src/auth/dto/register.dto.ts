import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Responsabilidade: validar e tipar o corpo da requisição POST /auth/register.
 *
 * Política de senha (mínimo OWASP):
 * - Pelo menos 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 número
 * A regex valida composição; o MinLength valida comprimento.
 *
 * Nota: não validamos complexidade excessiva (ex: símbolos obrigatórios)
 * para não prejudicar UX mobile. Ajustável conforme política futura.
 */
export class RegisterDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/(?=.*[A-Z])(?=.*\d)/, {
    message: 'Senha deve conter pelo menos 1 letra maiúscula e 1 número',
  })
  password: string;
}
