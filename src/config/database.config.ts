import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Responsabilidade: centralizar e tipar a configuração do banco de dados.
 *
 * registerAs cria um namespace ('database') no ConfigService, permitindo
 * acesso tipado: configService.get('database.host').
 * Evita strings mágicas espalhadas pelo código.
 *
 * synchronize: true APENAS em desenvolvimento.
 * Em produção, use migrations geradas pelo TypeORM CLI.
 * A flag é controlada pela variável NODE_ENV para evitar acidentes.
 */
export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'tudunum',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production', // NUNCA true em prod
    logging: process.env.NODE_ENV === 'development',
  }),
);
