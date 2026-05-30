import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * Responsabilidade: validar e tipar o input de geocoding por texto.
 *
 * Limites escolhidos: mínimo 3 caracteres para evitar buscas sem sentido
 * (ex: "SP" pode ser válido, mas "a" ou "ab" raramente produzem resultados úteis).
 * Máximo 200 caracteres: endereços completos com complemento raramente excedem isso.
 */
export class GeocodeRequestDto {
  @IsString({ message: 'O endereço deve ser uma string' })
  @MinLength(3, { message: 'O endereço deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'O endereço não pode exceder 200 caracteres' })
  address: string;
}
