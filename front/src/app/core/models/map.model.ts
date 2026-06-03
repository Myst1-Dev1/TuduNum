export enum TravelMode {
  WALKING = 'walking',
  DRIVING = 'driving',
//   BICYCLE = 'bicycle', // Verifique o enum exato no seu back (ex: 'bicycling' ou 'bicycle')
  TRANSIT = 'transit'
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  confidence: number;
}

export interface RouteResult {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  durationMinutes: number;
  mode: TravelMode;
}