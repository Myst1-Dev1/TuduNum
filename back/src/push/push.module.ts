import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { VapidConfigProvider } from './config/vapid-config.provider';
import { PushController } from './push.controller';

@Module({
  controllers: [PushController],
  providers: [PushService, VapidConfigProvider],
  exports: [PushService],
})
export class PushModule {}
