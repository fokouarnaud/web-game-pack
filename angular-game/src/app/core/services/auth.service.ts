import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '@core/models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  
  // Signals for reactive state management
  private readonly userSignal = signal<User | null>(null);
  private readonly isAuthenticatedSignal = signal<boolean>(false);
  private readonly isLoadingSignal = signal<boolean>(false);

  // Computed values
  public readonly user = computed(() => this.userSignal());
  public readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  public readonly isLoading = computed(() => this.isLoadingSignal());

  // Observables for backwards compatibility
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {}

  initializeAuth(): void {
    const token = this.storageService.getAccessToken();
    const user = this.storageService.getUser();

    if (token && user) {
      this.setCurrentUser(user);
    }
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const token = this.storageService.getAccessToken();
    
    if (token) {
      this.http.post(`${this.baseUrl}/logout`, {}).subscribe({
        complete: () => {
          this.handleLogout();
        },
        error: () => {
          // Even if logout fails on server, clear local state
          this.handleLogout();
        }
      });
    } else {
      this.handleLogout();
    }
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    
    if (!refreshToken) {
      this.handleLogout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }

  updateProfile(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/user/profile`, user).pipe(
      tap(updatedUser => {
        this.setCurrentUser(updatedUser);
        this.storageService.setUser(updatedUser);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.userSignal();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.some(r => r === role) ?? false;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    // Store tokens and user data
    this.storageService.setAccessToken(response.accessToken);
    this.storageService.setRefreshToken(response.refreshToken);
    this.storageService.setUser(response.user);

    // Update state
    this.setCurrentUser(response.user);
    this.isLoadingSignal.set(false);
  }

  private handleLogout(): void {
    // Clear storage
    this.storageService.clearAll();

    // Clear state
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.isLoadingSignal.set(false);
    this.currentUserSubject.next(null);

    // Redirect to login
    this.router.navigate(['/auth/login']);
  }

  private setCurrentUser(user: User): void {
    this.userSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    this.currentUserSubject.next(user);
  }
}