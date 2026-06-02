import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { PushSubscriptionStatusDto } from './dto/push-subscription-status.dto';

@Controller('push-subscriptions')
export class PushSubscriptionsController {
  constructor(private readonly service: PushSubscriptionsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePushSubscriptionDto,
  ): Promise<void> {
    await this.service.registerForUser(userId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(
    @CurrentUser('id') userId: string,
    @Body() body: { endpoint: string },
  ): Promise<void> {
    await this.service.revokeForUserByEndpoint(userId, body.endpoint);
  }

  @Get('status')
  async status(
    @CurrentUser('id') userId: string,
  ): Promise<PushSubscriptionStatusDto> {
    const active = await this.service.getStatus(userId);
    return { active };
  }

  @Get('validate')
  async validateAll() {
    // NOTE: This endpoint exposes subscription metadata and should be restricted in production.
    return this.service.validateAll();
  }
}
