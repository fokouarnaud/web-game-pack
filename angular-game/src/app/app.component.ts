import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { NavigationComponent } from '@shared/components/navigation/navigation.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ThemeService } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';
import { selectIsLoading } from '@core/store/ui/ui.selectors';
import { AppState } from '@core/store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    NavigationComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkTheme">
      <app-navigation></app-navigation>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <app-loading-spinner *ngIf="isLoading$ | async"></app-loading-spinner>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .main-content {
      flex: 1;
      overflow: auto;
      padding: 0;
    }

    .dark-theme {
      /* Dark theme styles will be handled by Angular Material */
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Angular Dialect Game';
  isDarkTheme = false;
  isLoading$: Observable<boolean>;

  constructor(
    private store: Store<AppState>,
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    this.isLoading$ = this.store.select(selectIsLoading);
  }

  ngOnInit(): void {
    // Initialize theme
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });

    // Auto-login if token exists
    this.authService.initializeAuth();
  }
}