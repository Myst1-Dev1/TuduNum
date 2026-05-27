/**
 * Responsabilidade: definir o contrato público da API de autenticação.
 * Este DTO é o que o cliente (Angular PWA) recebe em toda resposta de token.
 *
 * expiresIn: segundos até o access token expirar.
 * O cliente usa esse valor para agendar o refresh silencioso antes do vencimento.
 */
export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
