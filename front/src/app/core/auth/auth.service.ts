import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // Signals para gerenciamento de estado
  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);

  // Computeds reativos expostos publicamente
  public currentUser = this._currentUser.asReadonly();
  public token = this._token.asReadonly();
  public isAuthenticated = computed(() => !!this._token());

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('auth_token');
      // const savedUser = localStorage.getItem('auth_user');
      if (savedToken) {
        this._token.set(savedToken);
        // this._currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  public login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.setSession(response.accessToken);
      })
    );
  }

  public register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(response => {
        this.setSession(response.accessToken);
      })
    );
  }

  public logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    this._token.set(null);
    this._currentUser.set(null);
  }

  private setSession(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // localStorage.setItem('auth_user', JSON.stringify(user));
    }
    this._token.set(token);
    // this._currentUser.set(user);
  }
}
