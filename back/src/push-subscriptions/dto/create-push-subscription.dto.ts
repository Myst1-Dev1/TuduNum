import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

export class CreatePushSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  endpoint: string;

  @IsNotEmpty()
  @IsString()
  p256dh: string;

  @IsNotEmpty()
  @IsString()
  auth: string;

  @IsOptional()
  @IsString()
  userAgent?: string | null;
}
