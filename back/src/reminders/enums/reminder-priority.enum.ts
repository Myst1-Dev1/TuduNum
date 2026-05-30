/**
 * Responsabilidade: mapear os níveis de prioridade aceitos para os lembretes.
 * Usado na validação de entrada (DTOs) e no schema do banco de dados (TypeORM).
 */
export enum ReminderPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
