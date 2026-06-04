import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment.prod';
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
    this.checkTokenExpiration();
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

  private checkTokenExpiration(): void {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    const expiration = localStorage.getItem('auth_token_expiration');

    if (!token || !expiration) {
      this.logout();
      return;
    }

    if (Date.now() > Number(expiration)) {
      this.logout();
      return;
    }

    this._token.set(token);
  }

  // Seu método de logout para garantir que limpa tudo
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_expiration');
      // localStorage.removeItem('auth_user');
    }
    this._token.set(null);
    // Redirecionar para a tela de login se necessário
  }

  private setSession(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.exp) {
          const expirationTime = payload.exp * 1000; // JWT usa segundos
          localStorage.setItem(
            'auth_token_expiration',
            expirationTime.toString()
          );
        }
      } catch (error) {
        console.error('Erro ao decodificar JWT:', error);
      }
    }

    this._token.set(token);
  }
}
