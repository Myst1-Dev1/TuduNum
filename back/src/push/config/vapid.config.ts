import { registerAs } from '@nestjs/config';

export default registerAs('vapid', () => ({
  publicKey: process.env.VAPID_PUBLIC_KEY || null,
  privateKey: process.env.VAPID_PRIVATE_KEY || null,
  subject: process.env.VAPID_SUBJECT || 'mailto:contato@tudunu.com',
}));
