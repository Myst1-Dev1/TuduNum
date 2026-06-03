import { IsString, MinLength, MaxLength } from 'class-validator';

export class CityQueryDto {
  @IsString({ message: 'O nome da cidade deve ser uma string' })
  @MinLength(2, {
    message: 'O nome da cidade deve ter pelo menos 2 caracteres',
  })
  @MaxLength(100, {
    message: 'O nome da cidade não pode exceder 100 caracteres',
  })
  city: string;
}
