import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeSignal = signal<'light' | 'dark'>('light');
  private readonly isDarkThemeSubject = new BehaviorSubject<boolean>(false);

  public readonly currentTheme = computed(() => this.themeSignal());
  public readonly isDarkTheme$ = this.isDarkThemeSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check for stored theme preference
    const storedTheme = this.storageService.getTheme();
    
    if (storedTheme) {
      this.setTheme(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!this.storageService.getTheme()) {
          // Only follow system preference if no manual preference is set
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.themeSignal.set(theme);
    this.isDarkThemeSubject.next(theme === 'dark');
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark-theme', theme === 'dark');
    
    // Store preference
    this.storageService.setTheme(theme);
  }

  toggleTheme(): void {
    const currentTheme = this.themeSignal();
    this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  isDarkTheme(): boolean {
    return this.themeSignal() === 'dark';
  }
}