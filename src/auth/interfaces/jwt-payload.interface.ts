/**
 * Contrato do payload codificado dentro do JWT.
 *
 * Regra de ouro: manter MÍNIMO.
 * - sub: identificador canônico do usuário (RFC 7519)
 * - email: útil para logs e auditoria sem query extra
 *
 * NÃO incluir: name, role, permissions, isActive.
 * Motivo: cada campo extra aumenta o token, cria acoplamento entre
 * o schema do banco e o token, e exige re-emissão quando o dado muda.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}
