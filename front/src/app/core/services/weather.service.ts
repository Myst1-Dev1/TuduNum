import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '@env/environment.prod';
import { HourlyForecast, WeatherCityResponse, WeatherSummary } from '@core/models/weather.model';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/weather`;

  private readonly _weather = signal<WeatherSummary | null>(null);
  private readonly _hourlyForecast = signal<HourlyForecast[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly weather = this._weather.asReadonly();
  readonly hourlyForecast = this._hourlyForecast.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hasWeather = computed(() => !!this._weather());

  getByCity(city: string): Observable<WeatherSummary> {
    const normalizedCity = city.trim();

    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<WeatherCityResponse>(`${this.apiUrl}/city`, {
        params: { city: normalizedCity },
      })
      .pipe(
        map((response) => this.normalizeWeather(response, normalizedCity)),
        tap((weather) => {
          this._weather.set(weather);
          this._loading.set(false);
        }),
        catchError((error) => {
          this._error.set(error?.error?.message || 'Erro ao buscar clima');
          this._loading.set(false);
          return throwError(() => error);
        }),
      );
  }

  getHourlyForecast(city: string): Observable<HourlyForecast[]> {
    const normalizedCity = city.trim();

    return this.http
      .get<HourlyForecast[]>(`${this.apiUrl}/hourly-forecast`, { // Ajuste a rota se usou /hourly-forecast/city
        params: { city: normalizedCity },
      })
      .pipe(
        tap((forecast) => {
          this._hourlyForecast.set(forecast);
        }),
        catchError((error) => {
          this._error.set(error?.error?.message || 'Erro ao buscar previsão horária');
          return throwError(() => error);
        })
      );
  }

  getByCoordinates(lat: number, lon: number): Observable<WeatherSummary> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<WeatherCityResponse>(`${this.apiUrl}/coordinates`, {
        params: { lat, lon },
      })
      .pipe(
        map((response) => this.normalizeWeather(response, 'Localização Atual')),
        tap((weather) => {
          this._weather.set(weather);
          this._loading.set(false);
        }),
        catchError((error) => {
          this._error.set(error?.error?.message || 'Erro ao buscar clima por coordenadas');
          this._loading.set(false);
          return throwError(() => error);
        }),
      );
  }

  getHourlyForecastByCoordinates(lat: number, lon: number): Observable<HourlyForecast[]> {
    return this.http
      .get<HourlyForecast[]>(`${this.apiUrl}/hourly-forecast/coordinates`, { // Ajuste o path conforme seu Controller
        params: { lat, lon },
      })
      .pipe(
        tap((forecast) => this._hourlyForecast.set(forecast)),
        catchError((error) => {
          this._error.set(error?.error?.message || 'Erro ao buscar previsão horária');
          return throwError(() => error);
        })
      );
  }

  private normalizeWeather(response: WeatherCityResponse, requestedCity: string): WeatherSummary {
    const temperature = response.temperature ?? response.temp ?? response.main?.temp ?? 0;
    const condition =
      response.condition ??
      response.description ??
      response.weather?.description ??
      response.weather?.main ??
      'Unavailable';

    return {
      city: response.city ?? response.name ?? requestedCity,
      temperature: Math.round(temperature),
      condition,
      humidity: response.humidity,
      windSpeed: response.windSpeed,
    };
  }
}
