import { Module } from '@nestjs/common';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { OpenRouteServiceProvider } from './providers/open-route-service/open-route-service.provider';
import { InMemoryCacheProvider } from './cache/in-memory-cache.provider';
import { GEOLOCATION_PROVIDER } from './interfaces/geolocation-provider.interface';
import { GEOLOCATION_CACHE } from './cache/geolocation-cache.interface';

/**
 * Responsabilidade: montar e encapsular todas as dependências do módulo de geolocation.
 *
 * Menor privilégio: apenas GeolocationService é exportado. Provider, cache e
 * mapper são detalhes internos — outros módulos não podem injetar ou depender deles.
 *
 * Troca de provider: para migrar de ORS para Mapbox, alterar apenas:
 *   useClass: OpenRouteServiceProvider → useClass: MapboxProvider
 * Nenhum outro arquivo precisa ser modificado.
 *
 * Troca de cache: para migrar de in-memory para Redis:
 *   useClass: InMemoryCacheProvider → useClass: RedisCacheProvider
 * Nenhum outro arquivo precisa ser modificado.
 *
 * ADR — Tokens como Symbol:
 * Symbol previne colisões de nome com outros módulos e permite que o TypeScript
 * infira o tipo correto sem cast manual em useFactory.
 *
 * ADR — Por que não forFeature / forRoot?
 * O módulo não tem estado configurável por feature (como TypeORM). A configuração
 * vem do ConfigModule global via ConfigService — forRoot seria overengineering aqui.
 */
@Module({
  controllers: [GeolocationController],
  providers: [
    GeolocationService,

    // Provider de geolocalização: única linha a alterar para trocar de ORS → Mapbox
    {
      provide: GEOLOCATION_PROVIDER,
      useClass: OpenRouteServiceProvider,
    },

    // Cache de geolocalização: única linha a alterar para trocar in-memory → Redis
    {
      provide: GEOLOCATION_CACHE,
      useClass: InMemoryCacheProvider,
    },

    // Registrados como providers para que o NestJS resolva suas dependências
    OpenRouteServiceProvider,
    InMemoryCacheProvider,
  ],
  exports: [GeolocationService], // Apenas o serviço de domínio é público
})
export class GeolocationModule {}
