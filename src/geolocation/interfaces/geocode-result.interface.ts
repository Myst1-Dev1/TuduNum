/**
 * Responsabilidade: representar um resultado normalizado de geocoding.
 *
 * Completamente agnóstico ao provider — cada mapper (ORS, Mapbox, etc.)
 * é responsável por traduzir a resposta proprietária para este formato.
 *
 * confidence: score 0–1 normalizado pelo mapper de cada provider.
 * A normalização garante que consumers (ex: GeolocationService) possam
 * ordenar resultados por confiança sem conhecer o schema do provider.
 *
 * Readonly: imutabilidade explícita. Resultados de geocoding não devem
 * ser mutados após criação — facilitam cache e comparação.
 */
export interface GeocodeResult {
  readonly latitude: number;
  readonly longitude: number;
  readonly formattedAddress: string;
  readonly confidence: number; // 0–1
}
