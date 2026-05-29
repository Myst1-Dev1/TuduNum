import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { TravelMode } from '../interfaces/travel-mode.enum';

/**
 * Responsabilidade: validar e tipar o input de cálculo de rota.
 *
 * origin e destination são endereços em texto livre — o GeolocationService
 * faz o geocoding internamente, aproveitando o cache compartilhado.
 * Isso simplifica o contrato da API (o frontend não precisa resolver
 * coordenadas antes de pedir uma rota).
 *
 * mode: validado como enum para rejeitar valores inválidos na camada HTTP,
 * antes de atingir a lógica de negócio.
 */
export class RouteRequestDto {
  @IsString({ message: 'Origem deve ser uma string' })
  @MinLength(3, { message: 'Origem deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Origem não pode exceder 200 caracteres' })
  origin: string;

  @IsString({ message: 'Destino deve ser uma string' })
  @MinLength(3, { message: 'Destino deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Destino não pode exceder 200 caracteres' })
  destination: string;

  @IsEnum(TravelMode, {
    message: `Modo de transporte inválido. Use: ${Object.values(TravelMode).join(', ')}`,
  })
  mode: TravelMode;
}
