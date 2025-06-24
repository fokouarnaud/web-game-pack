import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { User } from '@core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly prefix = environment.storage.prefix;
  private readonly version = environment.storage.version;

  // Storage keys
  private readonly ACCESS_TOKEN_KEY = `${this.prefix}access_token`;
  private readonly REFRESH_TOKEN_KEY = `${this.prefix}refresh_token`;
  private readonly USER_KEY = `${this.prefix}user`;
  private readonly THEME_KEY = `${this.prefix}theme`;
  private readonly LANGUAGE_KEY = `${this.prefix}language`;
  private readonly VERSION_KEY = `${this.prefix}version`;

  constructor() {
    this.checkStorageVersion();
  }

  // Token management
  setAccessToken(token: string): void {
    this.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return this.getItem(this.ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    this.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return this.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    this.removeItem(this.ACCESS_TOKEN_KEY);
    this.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // User data management
  setUser(user: User): void {
    this.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = this.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  clearUser(): void {
    this.removeItem(this.USER_KEY);
  }

  // Theme management
  setTheme(theme: 'light' | 'dark'): void {
    this.setItem(this.THEME_KEY, theme);
  }

  getTheme(): 'light' | 'dark' | null {
    return this.getItem(this.THEME_KEY) as 'light' | 'dark' | null;
  }

  // Language management
  setLanguage(language: string): void {
    this.setItem(this.LANGUAGE_KEY, language);
  }

  getLanguage(): string | null {
    return this.getItem(this.LANGUAGE_KEY);
  }

  // Clear all storage
  clearAll(): void {
    this.clearTokens();
    this.clearUser();
    // Keep theme and language preferences
  }

  // Generic storage methods
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      // Fallback to sessionStorage
      try {
        sessionStorage.setItem(key, value);
      } catch (fallbackError) {
        console.error('Failed to save to sessionStorage:', fallbackError);
      }
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from storage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from storage:', error);
    }
  }

  // Check if storage is available
  isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Storage version management for migrations
  private checkStorageVersion(): void {
    const currentVersion = this.getItem(this.VERSION_KEY);
    
    if (currentVersion !== this.version) {
      // Version mismatch - clear storage to prevent conflicts
      this.migrateStorage(currentVersion, this.version);
      this.setItem(this.VERSION_KEY, this.version);
    }
  }

  private migrateStorage(fromVersion: string | null, toVersion: string): void {
    console.log(`Migrating storage from ${fromVersion || 'unknown'} to ${toVersion}`);
    
    // For now, simply clear everything except user preferences
    const theme = this.getTheme();
    const language = this.getLanguage();
    
    // Clear all storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage during migration:', error);
    }
    
    // Restore user preferences
    if (theme) this.setTheme(theme);
    if (language) this.setLanguage(language);
  }
}