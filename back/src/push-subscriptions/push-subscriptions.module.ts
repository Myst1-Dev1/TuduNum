import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushSubscription } from './entities/push-subscription.entity';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscriptionsRepository } from './push-subscriptions.repository';
import { PushSubscriptionsService } from './push-subscriptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([PushSubscription])],
  controllers: [PushSubscriptionsController],
  providers: [PushSubscriptionsService, PushSubscriptionsRepository],
  exports: [PushSubscriptionsService],
})
export class PushSubscriptionsModule {}
