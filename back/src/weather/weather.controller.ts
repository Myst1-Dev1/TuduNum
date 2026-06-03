import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { WeatherService } from './weather.service';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { CityQueryDto } from './dto/city-query.dto';
import { CoordinatesQueryDto } from './dto/coordinates-query.dto';
import { HourlyForecastDto } from './dto/hourly-forecast.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Public()
  @Get('city')
  async findByCity(@Query() query: CityQueryDto): Promise<WeatherResponseDto> {
    return this.weatherService.findByCity(query.city);
  }

  @Public()
  @Get('coordinates')
  async findByCoordinates(
    @Query() query: CoordinatesQueryDto,
  ): Promise<WeatherResponseDto> {
    return this.weatherService.findByCoordinates(query.lat, query.lon);
  }

  @Public()
  @Get('hourly-forecast')
  async findHourlyForecast(
    @Query() query: CityQueryDto,
  ): Promise<HourlyForecastDto[]> {
    return this.weatherService.findHourlyForecast(query.city);
  }

  @Public()
  @Get('hourly-forecast/coordinates')
  async findHourlyForecastByCoordinates(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
  ) {
    return this.weatherService.findHourlyForecastByCoordinates(lat, lon);
  }
}
