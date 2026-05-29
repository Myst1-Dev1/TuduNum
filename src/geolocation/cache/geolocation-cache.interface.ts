/**
 * Responsabilidade: contrato de cache para o módulo de geolocation.
 *
 * Abstração deliberadamente simples (get/set/delete com TTL por entrada)
 * para ser implementável tanto com Map nativo (Fase 1) quanto com Redis
 * (Fase 3, multi-instância) sem alterar nada no GeolocationService.
 *
 * Decisão de design: TTL é por entrada (não global) pois diferentes tipos
 * de dado podem ter validades diferentes (ex: rotas expiram mais rápido
 * que endereços fixos em contextos futuros).
 *
 * Token como Symbol para evitar colisão com outros módulos de cache que
 * possam ser adicionados ao projeto.
 */
export const GEOLOCATION_CACHE = Symbol('GEOLOCATION_CACHE');

export interface IGeolocationCache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  delete(key: string): void;
}
