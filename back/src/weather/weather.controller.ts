import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { WeatherService } from './weather.service';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { CityQueryDto } from './dto/city-query.dto';
import { CoordinatesQueryDto } from './dto/coordinates-query.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Public()
  @Get('city')
  async findByCity(
    @Query() query: CityQueryDto,
  ): Promise<WeatherResponseDto> {
    return this.weatherService.findByCity(query.city);
  }

  @Public()
  @Get('coordinates')
  async findByCoordinates(
    @Query() query: CoordinatesQueryDto,
  ): Promise<WeatherResponseDto> {
    return this.weatherService.findByCoordinates(query.lat, query.lon);
  }
}
