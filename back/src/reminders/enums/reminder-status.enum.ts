/**
 * Responsabilidade: representar os estados possíveis do ciclo de vida de um lembrete.
 * Usado na validação de DTOs e na persistência de dados.
 */
export enum ReminderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}
