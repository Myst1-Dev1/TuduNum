/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { HourlyForecastDto } from './dto/hourly-forecast.dto';

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

  async findHourlyForecast(city: string): Promise<HourlyForecastDto[]> {
    // Mudamos o path de /weather para /forecast
    const url = `${this.apiUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=pt_br`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        // Reaproveitando o seu tratamento de erros robusto
        if (response.status === 404)
          throw new NotFoundException('Cidade não encontrada');
        throw new BadGatewayException('Erro ao buscar previsão');
      }

      const data = await response.json();

      // data.list contém o array de previsões futuras
      const forecastList = data.list ?? [];

      // Pegamos apenas as primeiras 4 previsões para os 4 cards da UI
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return forecastList
        .slice(0, 4)
        .map((item: any, index: number) =>
          HourlyForecastDto.fromApiResponse(item, index),
        );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadGatewayException
      )
        throw error;
      this.logger.error(
        `Erro ao buscar previsão horária: ${(error as Error).message}`,
      );
      throw new BadGatewayException('Erro ao buscar dados da previsão');
    } finally {
      clearTimeout(timeout);
    }
  }

  async findHourlyForecastByCoordinates(
    lat: number,
    lon: number,
  ): Promise<HourlyForecastDto[]> {
    // Monta a URL apontando para /forecast usando lat e lon
    const url = `${this.apiUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=pt_br`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        this.logger.warn(
          `Falha na API de previsão por coordenadas: ${response.status} ${errorBody?.message ?? 'sem detalhes'}`,
        );

        if (response.status === 404) {
          throw new NotFoundException(
            errorBody?.message ?? 'Localização não encontrada',
          );
        }

        throw new BadGatewayException(
          errorBody?.message ?? 'Erro ao buscar dados da previsão',
        );
      }

      const data = await response.json();
      const forecastList = data.list ?? [];

      // Pegamos os primeiros 4 intervalos de 3 horas para alimentar seus cards da UI
      return forecastList
        .slice(0, 4)
        .map((item: any, index: number) =>
          HourlyForecastDto.fromApiResponse(item, index),
        );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadGatewayException
      ) {
        throw error;
      }
      this.logger.error(
        `Erro inesperado ao buscar previsão por coordenadas: ${(error as Error).message}`,
      );
      throw new BadGatewayException('Erro ao buscar dados da previsão');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async fetchWeather(url: string): Promise<WeatherResponseDto> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeout);

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
      if (
        error instanceof NotFoundException ||
        error instanceof BadGatewayException
      ) {
        throw error;
      }
      this.logger.error(
        `Erro inesperado ao buscar clima: ${(error as Error).message}`,
      );
      throw new BadGatewayException('Erro ao buscar dados climáticos');
    } finally {
      clearTimeout(timeout);
    }
  }
}
