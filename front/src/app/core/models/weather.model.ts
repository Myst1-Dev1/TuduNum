export interface WeatherCityResponse {
  city?: string;
  name?: string;
  temperature?: number;
  temp?: number;
  condition?: string;
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
}
