import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap da aplicação.
 *
 * ValidationPipe global:
 * - whitelist: true → remove automaticamente propriedades não declaradas nos DTOs.
 *   Impede que o cliente injete campos extras que passem para o service.
 * - forbidNonWhitelisted: true → lança BadRequestException se campos extras forem enviados.
 *   Combinado com whitelist, implementa a política de "entrada mínima".
 * - transform: true → converte tipos automaticamente (ex: string "900" → number 900).
 *   Necessário para que @IsNumber() funcione corretamente em query params.
 *
 * CORS:
 * Habilitado para desenvolvimento. Em produção, configure a origin
 * explicitamente via variável de ambiente (ex: CORS_ORIGIN=https://tudunum.app).
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 TuduNum API rodando em: http://localhost:${port}`);
}

void bootstrap();
