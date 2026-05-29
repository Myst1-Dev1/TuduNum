import {
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GEOLOCATION_PROVIDER,
} from './interfaces/geolocation-provider.interface';
import type { IGeolocationProvider } from './interfaces/geolocation-provider.interface';
import {
  GEOLOCATION_CACHE,
} from './cache/geolocation-cache.interface';
import type { IGeolocationCache } from './cache/geolocation-cache.interface';
import { GeocodeResult } from './interfaces/geocode-result.interface';
import { RouteResult } from './interfaces/route-result.interface';
import { TravelMode } from './interfaces/travel-mode.enum';

/**
 * Responsabilidade: orquestrador do domínio de geolocalização.
 *
 * Este serviço conhece apenas interfaces — nunca importa nenhuma classe
 * concreta de provider ou cache. É o ponto de entrada para outros módulos
 * (RemindersModule, WeatherAlertsModule) que precisarem de geocoding/routing.
 *
 * Estratégia de cache (chaves):
 * - Geocoding: `geo:${encodeURIComponent(address)}`
 * - Reverse:   `rev:${lat.toFixed(4)}:${lng.toFixed(4)}`
 *   → toFixed(4) = precisão de ~11m, suficiente para evitar cache miss por
 *     ruído de coordenada sem ser excessivamente granular.
 * - Rota:      `route:${oLat}:${oLng}:${dLat}:${dLng}:${mode}`
 *   → usa as coordenadas já resolvidas (pós-geocoding), garantindo que
 *     "Av. Paulista" e "Avenida Paulista, São Paulo" com mesmas coords
 *     compartilhem o cache de rota.
 *
 * TRANSIT: rejeitado via NotImplementedException (501) para sinalizar ao
 * cliente que o recurso está planejado mas não disponível nesta versão.
 */
@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);
  private readonly cacheTtlSeconds: number;

  constructor(
    @Inject(GEOLOCATION_PROVIDER)
    private readonly provider: IGeolocationProvider,

    @Inject(GEOLOCATION_CACHE)
    private readonly cache: IGeolocationCache,

    private readonly configService: ConfigService,
  ) {
    this.cacheTtlSeconds = this.configService.get<number>(
      'geolocation.cacheTtlSeconds',
      300,
    );
  }

  /**
   * Geocoding: resolve texto em lista de GeocodeResult ordenados por confidence.
   * O primeiro item é sempre o resultado mais confiável.
   */
  async geocode(address: string): Promise<GeocodeResult[]> {
    const cacheKey = `geo:${encodeURIComponent(address)}`;
    const cached = this.cache.get<GeocodeResult[]>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit geocoding: "${address}"`);
      return cached;
    }

    const results = await this.provider.geocode(address);
    this.cache.set(cacheKey, results, this.cacheTtlSeconds);
    return results;
  }

  /**
   * Reverse geocoding: resolve coordenadas em GeocodeResult.
   * Retorna o resultado de maior confiança para as coordenadas fornecidas.
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    const cacheKey = `rev:${lat.toFixed(4)}:${lng.toFixed(4)}`;
    const cached = this.cache.get<GeocodeResult>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit reverse geocoding: (${lat}, ${lng})`);
      return cached;
    }

    const result = await this.provider.reverseGeocode(lat, lng);
    this.cache.set(cacheKey, result, this.cacheTtlSeconds);
    return result;
  }

  /**
   * Cálculo de rota entre dois endereços em texto livre.
   *
   * Fluxo:
   * 1. Geocoda origem e destino (aproveitando cache individual de cada um)
   * 2. Valida que TRANSIT não foi solicitado (Fase 2)
   * 3. Checa cache de rota com coordenadas resolvidas
   * 4. Delega ao provider e armazena resultado em cache
   *
   * Por que geocodar antes de checar cache de rota?
   * Para que "Av. Paulista" e "Avenida Paulista, SP" com as mesmas coords
   * resolvidas compartilhem o cache de rota — o cache de geocoding absorve
   * a variação de texto e normaliza para coordenadas.
   */
  async calculateRoute(
    originAddress: string,
    destinationAddress: string,
    mode: TravelMode,
  ): Promise<RouteResult> {
    if (mode === TravelMode.TRANSIT) {
      throw new NotImplementedException(
        'Transporte público ainda não está disponível. Previsto para uma versão futura.',
      );
    }

    // Resolve endereços (com cache de geocoding)
    const [originResults, destinationResults] = await Promise.all([
      this.geocode(originAddress),
      this.geocode(destinationAddress),
    ]);

    const origin = originResults[0];
    const destination = destinationResults[0];

    // Cache de rota usa coordenadas já resolvidas (4 casas decimais)
    const cacheKey = [
      'route',
      origin.latitude.toFixed(4),
      origin.longitude.toFixed(4),
      destination.latitude.toFixed(4),
      destination.longitude.toFixed(4),
      mode,
    ].join(':');

    const cached = this.cache.get<RouteResult>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit rota: "${originAddress}" → "${destinationAddress}" [${mode}]`);
      return cached;
    }

    const result = await this.provider.calculateRoute(origin, destination, mode);
    this.cache.set(cacheKey, result, this.cacheTtlSeconds);

    this.logger.log(
      `Rota calculada: ${result.distanceMeters}m / ${result.durationSeconds}s [${mode}]`,
    );

    return result;
  }
}
