import { TravelMode } from './travel-mode.enum';

/**
 * Responsabilidade: representar o resultado normalizado de um cálculo de rota.
 *
 * distanceMeters e durationSeconds são mantidos em unidades base (SI) para
 * facilitar conversões no lado do cliente (ex: Angular pode exibir km ou milhas
 * sem que o backend precise saber a preferência do usuário).
 *
 * mode é incluído no resultado para que o caller possa confirmar qual modal
 * foi efetivamente usado, útil quando há fallback de provider no futuro.
 *
 * Readonly: resultado de rota não é mutável após cálculo.
 */
export interface RouteResult {
  readonly distanceMeters: number;
  readonly durationSeconds: number;
  readonly mode: TravelMode;
}
