import { GeocodeResult } from '../interfaces/geocode-result.interface';
import { RouteResult } from '../interfaces/route-result.interface';
import { TravelMode } from '../interfaces/travel-mode.enum';

/**
 * Responsabilidade: definir o contrato público da resposta de geocoding.
 *
 * Embora a interface GeocodeResult já seja limpa, o DTO de response
 * pode divergir no futuro (ex: adicionar campos calculados, ocultar
 * campos internos, ou serializar diferente para o frontend).
 *
 * Mantemos a separação agora para não criar acoplamento entre o contrato
 * interno (GeocodeResult) e o contrato HTTP (GeocodeResponseDto).
 */
export class GeocodeResponseDto {
  readonly latitude: number;
  readonly longitude: number;
  readonly formattedAddress: string;
  readonly confidence: number;

  static fromDomain(result: GeocodeResult): GeocodeResponseDto {
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      formattedAddress: result.formattedAddress,
      confidence: result.confidence,
    };
  }

  static fromDomainList(results: GeocodeResult[]): GeocodeResponseDto[] {
    return results.map(GeocodeResponseDto.fromDomain);
  }
}

/**
 * Responsabilidade: definir o contrato público da resposta de rota.
 *
 * Inclui campos derivados (distanceKm, durationMinutes) pré-calculados
 * para conveniência do frontend Angular, evitando lógica de conversão
 * no cliente — responsabilidade do servidor.
 *
 * Os valores em unidades base (meters, seconds) são mantidos para
 * que o frontend possa formatar conforme localização (km vs milhas).
 */
export class RouteResponseDto {
  readonly distanceMeters: number;
  readonly distanceKm: number;
  readonly durationSeconds: number;
  readonly durationMinutes: number;
  readonly mode: TravelMode;

  static fromDomain(result: RouteResult): RouteResponseDto {
    return {
      distanceMeters: result.distanceMeters,
      distanceKm: Math.round((result.distanceMeters / 1000) * 10) / 10,
      durationSeconds: result.durationSeconds,
      durationMinutes: Math.round(result.durationSeconds / 60),
      mode: result.mode,
    };
  }
}
