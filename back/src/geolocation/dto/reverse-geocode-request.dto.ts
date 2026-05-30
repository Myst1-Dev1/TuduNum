import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

/**
 * Responsabilidade: validar e tipar coordenadas geográficas para reverse geocoding.
 *
 * @Type(Number): necessário porque query params chegam como string no HTTP;
 * class-transformer converte para number antes da validação.
 *
 * Limites: latitude [-90, 90] e longitude [-180, 180] são os limites
 * geográficos absolutos definidos pelo padrão WGS-84.
 */
export class ReverseGeocodeRequestDto {
  @IsNumber({}, { message: 'Latitude deve ser um número' })
  @Min(-90, { message: 'Latitude mínima: -90' })
  @Max(90, { message: 'Latitude máxima: 90' })
  @Type(() => Number)
  lat: number;

  @IsNumber({}, { message: 'Longitude deve ser um número' })
  @Min(-180, { message: 'Longitude mínima: -180' })
  @Max(180, { message: 'Longitude máxima: 180' })
  @Type(() => Number)
  lng: number;
}
