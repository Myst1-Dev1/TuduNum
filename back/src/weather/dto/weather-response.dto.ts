/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export class WeatherResponseDto {
  temperature: number;
  feelsLike: number;
  tempMin: number; // Novo
  tempMax: number; // Novo
  description: string;
  humidity: number;
  pressure: number; // Novo
  visibility: number; // Novo
  windSpeed: number;
  windDeg: number; // Novo
  clouds: number; // Novo
  icon: string;
  cityName: string;
  country: string;
  sunrise: number; // Novo (Timestamp Unix)
  sunset: number; // Novo (Timestamp Unix)

  static fromApiResponse(data: Record<string, any>): WeatherResponseDto {
    return {
      temperature:
        data.main?.temp != null ? Math.round(data.main.temp * 10) / 10 : 0,
      feelsLike:
        data.main?.feels_like != null
          ? Math.round(data.main.feels_like * 10) / 10
          : 0,
      tempMin:
        data.main?.temp_min != null
          ? Math.round(data.main.temp_min * 10) / 10
          : 0,
      tempMax:
        data.main?.temp_max != null
          ? Math.round(data.main.temp_max * 10) / 10
          : 0,
      description: data.weather?.[0]?.description ?? '',
      humidity: data.main?.humidity ?? 0,
      pressure: data.main?.pressure ?? 0,
      visibility: data.visibility ?? 0, // Vem direto na raiz do JSON
      windSpeed:
        data.wind?.speed != null
          ? Math.round(data.wind.speed * 3.6 * 10) / 10 // Convertendo para km/h
          : 0,
      windDeg: data.wind?.deg ?? 0,
      clouds: data.clouds?.all ?? 0,
      icon: data.weather?.[0]?.icon ?? '',
      cityName: data.name ?? '',
      country: data.sys?.country ?? '',
      sunrise: data.sys?.sunrise ?? 0,
      sunset: data.sys?.sunset ?? 0,
    };
  }
}