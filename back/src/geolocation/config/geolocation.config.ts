import { registerAs } from '@nestjs/config';

/**
 * Responsabilidade: centralizar e tipar a configuração do módulo de geolocation.
 *
 * registerAs cria o namespace 'geolocation' no ConfigService, evitando strings
 * mágicas espalhadas pelo código.
 *
 * Fail-fast: apiKey não tem default — se ausente, o provider lança erro no boot,
 * impedindo a aplicação de subir em estado inválido.
 *
 * cacheTtlSeconds: TTL padrão de 5 minutos é adequado para dados de geocoding,
 * que raramente mudam. Endereços são estáveis; rotas variam pouco no curto prazo.
 */
export default registerAs('geolocation', () => ({
  apiKey: process.env.ORS_API_KEY, // Obrigatório — validado via getOrThrow no provider
  apiUrl:
    process.env.ORS_API_URL ?? 'https://api.openrouteservice.org/v2',
  requestTimeoutMs: Number(process.env.GEOLOCATION_TIMEOUT_MS) || 8000,
  cacheTtlSeconds: Number(process.env.GEOLOCATION_CACHE_TTL_S) || 300,
}));
