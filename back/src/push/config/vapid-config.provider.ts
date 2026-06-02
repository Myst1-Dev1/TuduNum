import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const VapidConfigProvider: Provider = {
  provide: 'VAPID_CONFIG',
  useFactory: (configService: ConfigService) => {
    const publicKey = configService.get<string>('vapid.publicKey');
    const privateKey = configService.get<string>('vapid.privateKey');
    const subject = configService.get<string>('vapid.subject');

    if (!publicKey || !privateKey) {
      throw new Error('VAPID keys are required (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)');
    }

    return { publicKey, privateKey, subject };
  },
  inject: [ConfigService],
};
