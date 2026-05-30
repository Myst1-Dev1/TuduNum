import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherResponseDto } from './dto/weather-response.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly requestTimeout = 8000;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('WEATHER_API_KEY');
    this.apiUrl = this.configService.get<string>(
      'WEATHER_API_URL',
      'https://api.openweathermap.org/data/2.5',
    );
  }

  async findByCity(city: string): Promise<WeatherResponseDto> {
    const url = `${this.apiUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;
    return this.fetchWeather(url);
  }

  async findByCoordinates(
    lat: number,
    lon: number,
  ): Promise<WeatherResponseDto> {
    const url = `${this.apiUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;
    return this.fetchWeather(url);
  }

  private async fetchWeather(url: string): Promise<WeatherResponseDto> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.requestTimeout,
    );

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        this.logger.warn(
          `Falha na API de clima: ${response.status} ${errorBody?.message ?? 'sem detalhes'}`,
        );

        if (response.status === 404) {
          throw new NotFoundException(
            errorBody?.message ?? 'Cidade não encontrada',
          );
        }

        throw new BadGatewayException(
          errorBody?.message ?? 'Erro ao buscar dados climáticos',
        );
      }

      const data = await response.json();
      return WeatherResponseDto.fromApiResponse(data);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadGatewayException) {
        throw error;
      }
      this.logger.error(`Erro inesperado ao buscar clima: ${(error as Error).message}`);
      throw new BadGatewayException('Erro ao buscar dados climáticos');
    } finally {
      clearTimeout(timeout);
    }
  }
}
