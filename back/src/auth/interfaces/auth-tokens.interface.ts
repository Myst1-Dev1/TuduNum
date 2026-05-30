/**
 * Contrato interno do par de tokens gerado pelo AuthService.
 * Usado internamente entre AuthService → AuthController.
 * O Controller serializa isso via TokenResponseDto antes de enviar ao cliente.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
