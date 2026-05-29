import { GeocodeResult } from '../../interfaces/geocode-result.interface';
import { RouteResult } from '../../interfaces/route-result.interface';
import { TravelMode } from '../../interfaces/travel-mode.enum';

/**
 * Responsabilidade: única classe que conhece o schema JSON da API ORS.
 *
 * Isola completamente o parsing da resposta proprietária do ORS.
 * Se o ORS alterar sua estrutura de resposta, apenas este arquivo precisa
 * ser atualizado — nenhum outro componente do módulo é afetado.
 *
 * Métodos estáticos: o mapper é stateless (sem dependências injetáveis),
 * portanto não precisa ser instanciado via DI — chamado diretamente pelo provider.
 *
 * Referências da API ORS:
 * - Geocoding: https://openrouteservice.org/dev/#/api-docs/geocode/search/get
 * - Directions: https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/post
 */
export class OrsResponseMapper {
  /**
   * Mapeia a resposta GeoJSON do endpoint /geocode/search do ORS para GeocodeResult[].
   *
   * Estrutura ORS: FeatureCollection com features[], cada feature tem:
   * - geometry.coordinates: [longitude, latitude] (ordem GeoJSON — invertida!)
   * - properties.label: endereço formatado
   * - properties.confidence: score 0–1 (já normalizado pelo ORS)
   */
  static toGeocodeResults(data: Record<string, any>): GeocodeResult[] {
    const features: any[] = data?.features ?? [];

    return features.map((feature) => ({
      // GeoJSON usa [lng, lat] — invertemos para a convenção [lat, lng] do domínio
      latitude: feature.geometry?.coordinates?.[1] ?? 0,
      longitude: feature.geometry?.coordinates?.[0] ?? 0,
      formattedAddress: feature.properties?.label ?? '',
      confidence: feature.properties?.confidence ?? 0,
    }));
  }

  /**
   * Mapeia a resposta do endpoint /geocode/reverse do ORS.
   * Mesmo schema de /geocode/search — reutiliza toGeocodeResults e pega o primeiro.
   */
  static toGeocodeResult(data: Record<string, any>): GeocodeResult {
    const results = OrsResponseMapper.toGeocodeResults(data);

    if (results.length === 0) {
      return { latitude: 0, longitude: 0, formattedAddress: '', confidence: 0 };
    }

    return results[0];
  }

  /**
   * Mapeia a resposta do endpoint /v2/directions/{profile}/json do ORS.
   *
   * Estrutura ORS: { routes: [{ summary: { distance, duration } }] }
   * - distance: metros
   * - duration: segundos
   *
   * Ambas as unidades já são SI — sem conversão necessária.
   */
  static toRouteResult(data: Record<string, any>, mode: TravelMode): RouteResult {
    const summary = data?.routes?.[0]?.summary;

    return {
      distanceMeters: Math.round(summary?.distance ?? 0),
      durationSeconds: Math.round(summary?.duration ?? 0),
      mode,
    };
  }
}
