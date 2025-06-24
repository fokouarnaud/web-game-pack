import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <button 
        mat-icon-button 
        (click)="sidenavOpen = !sidenavOpen"
        *ngIf="authService.isAuthenticated()"
        aria-label="Menu">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="app-title">
        <a routerLink="/" class="title-link">Dialect Game</a>
      </span>

      <span class="spacer"></span>

      <div class="nav-actions">
        <!-- Theme toggle -->
        <button 
          mat-icon-button 
          (click)="themeService.toggleTheme()"
          [attr.aria-label]="themeService.isDarkTheme() ? 'Switch to light theme' : 'Switch to dark theme'">
          <mat-icon>{{themeService.isDarkTheme() ? 'light_mode' : 'dark_mode'}}</mat-icon>
        </button>

        <!-- User menu -->
        <div *ngIf="authService.isAuthenticated(); else loginButton">
          <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-info" mat-menu-item disabled>
              <div class="user-name">{{authService.user()?.firstName}} {{authService.user()?.lastName}}</div>
              <div class="user-email">{{authService.user()?.email}}</div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Profil</span>
            </button>
            <button mat-menu-item routerLink="/progress">
              <mat-icon>trending_up</mat-icon>
              <span>Progression</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="authService.logout()">
              <mat-icon>logout</mat-icon>
              <span>Déconnexion</span>
            </button>
          </mat-menu>
        </div>

        <ng-template #loginButton>
          <button mat-button routerLink="/auth/login">
            Connexion
          </button>
          <button mat-raised-button color="accent" routerLink="/auth/register">
            Inscription
          </button>
        </ng-template>
      </div>
    </mat-toolbar>

    <!-- Sidenav -->
    <mat-sidenav-container class="sidenav-container" *ngIf="authService.isAuthenticated()">
      <mat-sidenav 
        #sidenav 
        [opened]="sidenavOpen" 
        mode="over" 
        class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/lessons" (click)="sidenav.close()">
            <mat-icon matListItemIcon>school</mat-icon>
            <span matListItemTitle>Leçons</span>
          </a>
          <a mat-list-item routerLink="/progress" (click)="sidenav.close()">
            <mat-icon matListItemIcon>trending_up</mat-icon>
            <span matListItemTitle>Progression</span>
          </a>
          <a mat-list-item routerLink="/profile" (click)="sidenav.close()">
            <mat-icon matListItemIcon>person</mat-icon>
            <span matListItemTitle>Profil</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
    </mat-sidenav-container>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .app-title {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .title-link {
      color: inherit;
      text-decoration: none;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-info {
      pointer-events: none;
      opacity: 0.7;
    }

    .user-name {
      font-weight: 500;
    }

    .user-email {
      font-size: 0.85rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .sidenav-container {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .sidenav {
      width: 250px;
    }

    @media (max-width: 768px) {
      .nav-actions button:not([mat-icon-button]) {
        display: none;
      }
    }
  `]
})
export class NavigationComponent {
  sidenavOpen = false;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}
}