import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesQueryDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'A latitude deve ser um número' })
  @Min(-90, { message: 'A latitude deve estar entre -90 e 90' })
  @Max(90, { message: 'A latitude deve estar entre -90 e 90' })
  lat: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'A longitude deve ser um número' })
  @Min(-180, { message: 'A longitude deve estar entre -180 e 180' })
  @Max(180, { message: 'A longitude deve estar entre -180 e 180' })
  lon: number;
}
