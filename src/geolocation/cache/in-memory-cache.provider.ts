import { Injectable } from '@nestjs/common';
import { IGeolocationCache } from './geolocation-cache.interface';

interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt: number; // Unix timestamp em ms
}

/**
 * Responsabilidade: implementação in-memory de IGeolocationCache usando
 * Map nativo do Node.js com TTL por entrada.
 *
 * Por que não node-cache, lru-cache ou similar?
 * Seguindo o princípio de minimismo de dependências, Map nativo é suficiente
 * para Fase 1 com instância única. A interface IGeolocationCache garante
 * substituição transparente por Redis sem alterar GeolocationService.
 *
 * Limpeza lazy: entradas expiradas são removidas no próximo get(),
 * evitando timers de background que complicariam testes e consumiriam
 * recursos desnecessariamente para o volume da Fase 1.
 *
 * Idempotência: set() sobrescreve entradas existentes com novo TTL —
 * seguro para re-execução e atualização de cache.
 */
@Injectable()
export class InMemoryCacheProvider implements IGeolocationCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      // Limpeza lazy: remove entrada expirada ao acessar
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}
