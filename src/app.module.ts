import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import databaseConfig from './config/database.config';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RemindersModule } from './reminders/reminders.module';
import { WeatherModule } from './weather/weather.module';
import { WeatherAlertsModule } from './weather-alerts/weather-alerts.module';

/**
 * Responsabilidade: raiz da aplicação. Registra configurações globais,
 * módulos de infraestrutura e módulos de feature.
 *
 * Ordem de imports é intencional:
 * 1. ConfigModule — deve ser o primeiro para que variáveis de ambiente
 *    estejam disponíveis a todos os outros módulos na inicialização.
 * 2. ThrottlerModule — infraestrutura de rate limiting (global via APP_GUARD).
 * 3. TypeOrmModule — banco de dados (depende do ConfigModule).
 * 4. Feature modules (AuthModule, UsersModule).
 *
 * Guards globais (APP_GUARD):
 * - ThrottlerGuard: rate limiting padrão (configurável por endpoint via @Throttle()).
 * - JwtAuthGuard: proteção JWT por padrão; opt-out via @Public().
 * A ordem importa: ThrottlerGuard roda antes do JwtAuthGuard.
 * Isso bloqueia IPs abusivos ANTES de processar tokens → menos carga no banco.
 */
@Module({
  imports: [
    // 1. Configuração global — isGlobal:true dispensa import em cada módulo
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),

    // 2. Rate limiting global — limites padrão; endpoints críticos sobrescrevem via @Throttle()
    ThrottlerModule.forRoot([
      {
        ttl: 60000,  // janela de 60 segundos
        limit: 100,  // 100 requisições/minuto por IP (padrão para rotas comuns)
      },
    ]),

    // 3. Banco de dados — configuração lazy via ConfigService
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.getOrThrow('database'),
    }),

    // 4. Feature modules
    UsersModule,
    AuthModule,
    RemindersModule,
    NotificationsModule,
    WeatherModule,
    WeatherAlertsModule,
  ],
  providers: [
    // ThrottlerGuard global — bloqueia por IP antes de qualquer lógica de negócio
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // JwtAuthGuard global — protege todas as rotas; opt-out via @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
