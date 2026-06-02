/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get } from '@nestjs/common';
import { Inject } from '@nestjs/common';

@Controller('push')
export class PushController {
  constructor(@Inject('VAPID_CONFIG') private readonly vapid: any) {}

  @Get('vapid-public-key')
  getPublicKey(): { publicKey: string } {
    console.log('VAPID CONFIG:', this.vapid);
    return { publicKey: this.vapid.publicKey };
  }
}
