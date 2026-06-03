export interface WeatherCityResponse {
  city?: string;
  name?: string;
  temperature?: number;
  temp?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  description?: string;
  weather?: {
    main?: string;
    description?: string;
  };
  main?: {
    temp?: number;
  };
}

export interface WeatherSummary {
  city: string;
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  date?: Date;         // Data completa para formatação
}

export interface HourlyForecast {
  time: string;        // "Agora", "15:00", etc.
  temperature: number; // 24
  icon: string;        // "04n"
  description: string; // "nublado"
}