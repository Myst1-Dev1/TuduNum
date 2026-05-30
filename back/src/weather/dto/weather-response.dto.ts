export class WeatherResponseDto {
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  cityName: string;
  country: string;

  static fromApiResponse(data: Record<string, any>): WeatherResponseDto {
    return {
      temperature:
        data.main?.temp != null
          ? Math.round(data.main.temp * 10) / 10
          : 0,
      feelsLike:
        data.main?.feels_like != null
          ? Math.round(data.main.feels_like * 10) / 10
          : 0,
      description: data.weather?.[0]?.description ?? '',
      humidity: data.main?.humidity ?? 0,
      windSpeed:
        data.wind?.speed != null
          ? Math.round(data.wind.speed * 3.6 * 10) / 10
          : 0,
      icon: data.weather?.[0]?.icon ?? '',
      cityName: data.name ?? '',
      country: data.sys?.country ?? '',
    };
  }
}
