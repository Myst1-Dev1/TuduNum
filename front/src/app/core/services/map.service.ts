import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { GeocodeResult, RouteResult, TravelMode } from '../models/map.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/geo`;

  // States com Signals
  private readonly _routeInfo = signal<RouteResult | null>(null);
  private readonly _loadingRoute = signal(false);
  private readonly _currentAddress = signal<string | null>(null);

  readonly routeInfo = this._routeInfo.asReadonly();
  readonly loadingRoute = this._loadingRoute.asReadonly();
  readonly currentAddress = this._currentAddress.asReadonly();

  // 1. GET /geo/search?address=...
  searchAddress(address: string): Observable<GeocodeResult[]> {
    return this.http.get<GeocodeResult[]>(`${this.apiUrl}/search`, {
      params: { address },
    });
  }

  // 2. GET /geo/reverse?lat=...&lng=...
  reverseGeocode(lat: number, lng: number): Observable<GeocodeResult> {
    return this.http.get<GeocodeResult>(`${this.apiUrl}/reverse`, {
      params: { lat: lat.toString(), lng: lng.toString() },
    }).pipe(
      tap((res) => this._currentAddress.set(res.formattedAddress)),
      catchError((err) => throwError(() => err))
    );
  }

  // 3. POST /geo/route
  getRoute(origin: string, destination: string, mode: TravelMode): Observable<RouteResult> {
    this._loadingRoute.set(true);
    return this.http.post<RouteResult>(`${this.apiUrl}/route`, {
      origin,
      destination,
      mode,
    }).pipe(
      tap((route) => {
        this._routeInfo.set(route);
        this._loadingRoute.set(false);
      }),
      catchError((error) => {
        this._loadingRoute.set(false);
        return throwError(() => error);
      })
    );
  }

  clearRoute(): void {
    this._routeInfo.set(null);
  }
}