import { GeocodeResult } from './geocode-result.interface';
import { RouteResult } from './route-result.interface';
import { TravelMode } from './travel-mode.enum';

/**
 * Responsabilidade: contrato que todo adaptador de provider de geolocalização
 * deve implementar.
 *
 * É o único ponto de acoplamento entre o domínio (GeolocationService) e a
 * infraestrutura (ORS, Mapbox, etc.). O GeolocationService nunca importa
 * uma implementação concreta — injeta apenas este contrato via token.
 *
 * Decisão de design: método geocode retorna array pois providers retornam
 * múltiplos candidatos por endereço. O GeolocationService seleciona o
 * primeiro (maior confidence) e expõe isso ao caller.
 *
 * ADR: token de injeção como constante tipada evita string magic e permite
 * type inference no useFactory sem cast manual.
 */
export const GEOLOCATION_PROVIDER = Symbol('GEOLOCATION_PROVIDER');

export interface IGeolocationProvider {
  geocode(address: string): Promise<GeocodeResult[]>;
  reverseGeocode(lat: number, lng: number): Promise<GeocodeResult>;
  calculateRoute(
    origin: GeocodeResult,
    destination: GeocodeResult,
    mode: TravelMode,
  ): Promise<RouteResult>;
}
