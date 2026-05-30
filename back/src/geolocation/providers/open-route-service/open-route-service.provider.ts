import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeocodeResult } from '../../interfaces/geocode-result.interface';
import { RouteResult } from '../../interfaces/route-result.interface';
import { TravelMode } from '../../interfaces/travel-mode.enum';
import { IGeolocationProvider } from '../../interfaces/geolocation-provider.interface';
import { OrsResponseMapper } from './ors-response.mapper';

/**
 * Mapeamento de TravelMode para perfil de rota do ORS.
 *
 * ORS usa perfis específicos na URL: driving-car, foot-walking, etc.
 * O mapeamento está aqui (no adaptador) porque é detalhe do provider —
 * o domínio fala em TravelMode, o provider traduz para o dialeto da API.
 *
 * TRANSIT não está mapeado: o provider rejeita antes de chegar aqui
 * pois o GeolocationService valida e lança NotImplementedException.
 */
const ORS_PROFILE_MAP: Record<Exclude<TravelMode, TravelMode.TRANSIT>, string> = {
  [TravelMode.WALKING]: 'foot-walking',
  [TravelMode.DRIVING]: 'driving-car',
};

/**
 * Responsabilidade: adaptador de infraestrutura para a API OpenRouteService.
 *
 * Este provider é o único lugar da aplicação que conhece:
 * - a URL da API ORS
 * - os headers proprietários (Authorization)
 * - o formato de request e response do ORS
 *
 * Fora daqui, nenhum módulo sabe que o provider é ORS.
 *
 * Retry com backoff exponencial: ORS free tier pode retornar 429 (rate limit)
 * ou erros 5xx transitórios. Implementado sem dependência externa (setTimeout).
 * Máximo de 2 retries (delays: 1s, 2s) para não degradar a UX.
 *
 * Consistência com o projeto: usa fetch nativo + AbortController para timeout,
 * exatamente como WeatherService.
 */
@Injectable()
export class OpenRouteServiceProvider implements IGeolocationProvider {
  private readonly logger = new Logger(OpenRouteServiceProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly timeoutMs: number;

  private static readonly MAX_RETRIES = 2;
  private static readonly RETRY_DELAYS_MS = [1000, 2000];

  constructor(private readonly configService: ConfigService) {
    // Fail-fast: se a chave não existir, o boot falha imediatamente
    this.apiKey = this.configService.getOrThrow<string>('geolocation.apiKey');
    this.apiUrl = this.configService.get<string>(
      'geolocation.apiUrl',
      'https://api.openrouteservice.org/v2',
    );
    this.timeoutMs = this.configService.get<number>(
      'geolocation.requestTimeoutMs',
      8000,
    );
  }

  async geocode(address: string): Promise<GeocodeResult[]> {
    const normalizedAddress = address.replace(/\+/g, ' ');
    const baseUrl = this.apiUrl.replace(/\/v2\/?$/, '');
    const url = `${baseUrl}/geocode/search?api_key=${this.apiKey}&text=${encodeURIComponent(normalizedAddress)}&size=5`;
    const data = await this.fetchWithRetry(url, 'GET', undefined, 'geocoding');
    const results = OrsResponseMapper.toGeocodeResults(data);

    if (results.length === 0) {
      throw new NotFoundException(
        `Nenhum resultado encontrado para o endereço: "${address}"`,
      );
    }

    return results;
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    const baseUrl = this.apiUrl.replace(/\/v2\/?$/, '');
    const url = `${baseUrl}/geocode/reverse?api_key=${this.apiKey}&point.lat=${lat}&point.lon=${lng}&size=1`;
    const data = await this.fetchWithRetry(url, 'GET', undefined, 'reverse geocoding');
    return OrsResponseMapper.toGeocodeResult(data);
  }

  async calculateRoute(
    origin: GeocodeResult,
    destination: GeocodeResult,
    mode: TravelMode,
  ): Promise<RouteResult> {
    const profile = ORS_PROFILE_MAP[mode as Exclude<TravelMode, TravelMode.TRANSIT>];
    const baseUrl = this.apiUrl.endsWith('/v2') ? this.apiUrl : `${this.apiUrl.replace(/\/$/, '')}/v2`;
    const url = `${baseUrl}/directions/${profile}/json?api_key=${this.apiKey}`;

    const body = {
      coordinates: [
        [origin.longitude, origin.latitude],       // ORS usa [lng, lat]
        [destination.longitude, destination.latitude],
      ],
    };

    const data = await this.fetchWithRetry(url, 'POST', body, 'route calculation');
    return OrsResponseMapper.toRouteResult(data, mode);
  }

  /**
   * Executa fetch com timeout via AbortController e retry com backoff exponencial.
   *
   * Retry apenas em erros de rede (AbortError, TypeError) e respostas 5xx/429.
   * Erros 4xx (exceto 429) são definitivos — não faz sentido retentar.
   */
  private async fetchWithRetry(
    url: string,
    method: 'GET' | 'POST',
    body: unknown,
    context: string,
    attempt = 0,
  ): Promise<Record<string, any>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, application/geo+json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        return this.handleHttpError(response, context, url, method, body, attempt);
      }

      return response.json() as Promise<Record<string, any>>;
    } catch (error) {
      if (error instanceof BadGatewayException || error instanceof NotFoundException) {
        throw error;
      }

      const isRetryable =
        (error as Error).name === 'AbortError' ||
        error instanceof TypeError;

      if (isRetryable && attempt < OpenRouteServiceProvider.MAX_RETRIES) {
        const delay = OpenRouteServiceProvider.RETRY_DELAYS_MS[attempt];
        this.logger.warn(
          `ORS ${context} falhou (tentativa ${attempt + 1}/${OpenRouteServiceProvider.MAX_RETRIES + 1}). ` +
          `Retry em ${delay}ms. Erro: ${(error as Error).message}`,
        );
        await this.sleep(delay);
        return this.fetchWithRetry(url, method, body, context, attempt + 1);
      }

      this.logger.error(`ORS ${context}: erro inesperado após retries. ${(error as Error).message}`);
      throw new BadGatewayException(`Erro ao consultar serviço de geolocalização`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async handleHttpError(
    response: Response,
    context: string,
    url: string,
    method: 'GET' | 'POST',
    body: unknown,
    attempt: number,
  ): Promise<Record<string, any>> {
    const errorBody = await response.json().catch(() => null);
    const status = response.status;

    // 429 e 5xx são retentáveis
    if ((status === 429 || status >= 500) && attempt < OpenRouteServiceProvider.MAX_RETRIES) {
      const delay = OpenRouteServiceProvider.RETRY_DELAYS_MS[attempt];
      this.logger.warn(
        `ORS ${context} retornou ${status} (tentativa ${attempt + 1}). Retry em ${delay}ms.`,
      );
      await this.sleep(delay);
      return this.fetchWithRetry(url, method, body, context, attempt + 1);
    }

    this.logger.warn(
      `ORS ${context}: HTTP ${status} — ${errorBody?.error?.message ?? 'sem detalhes'}`,
    );

    if (status === 404) {
      throw new NotFoundException(errorBody?.error?.message ?? 'Recurso não encontrado');
    }

    throw new BadGatewayException(
      errorBody?.error?.message ?? 'Erro ao consultar serviço de geolocalização',
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
