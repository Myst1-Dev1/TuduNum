/**
 * Responsabilidade: definir os modos de transporte suportados pelo domínio.
 *
 * TRANSIT é declarado aqui na Fase 1 para fixar o contrato público da API
 * sem causar breaking change futuro. O GeolocationService rejeita TRANSIT
 * com NotImplementedException enquanto o provider não suportar.
 *
 * Decisão de design: usar enum string (não numérico) para que o valor seja
 * legível nos logs, responses JSON e chaves de cache sem mapeamento adicional.
 */
export enum TravelMode {
  WALKING = 'walking',
  DRIVING = 'driving',
  TRANSIT = 'transit', // Fase 2 — não implementado no provider ORS
}
