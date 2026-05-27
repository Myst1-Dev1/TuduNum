import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

/**
 * Responsabilidade: agrupar e registrar todos os artefatos de autenticação.
 *
 * JwtModule.registerAsync:
 * Configuração lazy via ConfigService para garantir que as variáveis de ambiente
 * estejam carregadas antes da inicialização do módulo. O secret é definido
 * no método signAsync() do AuthService (permite usar secrets diferentes por token),
 * por isso passamos um secret placeholder aqui — o JwtModule é usado apenas
 * para injeção do JwtService, não para configuração global de signing.
 *
 * Por que não exportamos AuthService?
 * Outros módulos (ex: RemindersModule) não precisam gerar tokens — apenas
 * verificar identidade via @CurrentUser() decorator e JwtAuthGuard global.
 * Exportar AuthService criaria acoplamento desnecessário.
 *
 * Extensibilidade OAuth:
 * Para adicionar Google OAuth no futuro:
 * 1. Criar GoogleStrategy em strategies/google.strategy.ts
 * 2. Adicionar GoogleStrategy em providers[]
 * 3. Criar GoogleAuthGuard em guards/google-auth.guard.ts
 * Nenhuma alteração nos arquivos existentes. Aberto para extensão, fechado para modificação (OCP).
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // O secret aqui é um fallback — signing real acontece em AuthService.generateTokens()
        // com secrets específicos por tipo de token.
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<number>('JWT_EXPIRES_IN', 900) },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
