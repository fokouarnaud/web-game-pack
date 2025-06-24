import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">sentiment_dissatisfied</mat-icon>
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon>
          Retour à l'accueil
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 2rem;
    }

    .not-found-content {
      text-align: center;
      max-width: 500px;
    }

    .not-found-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: rgba(0, 0, 0, 0.4);
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 4rem;
      margin: 0;
      color: #f44336;
    }

    h2 {
      font-size: 2rem;
      margin: 1rem 0;
      color: rgba(0, 0, 0, 0.7);
    }

    p {
      font-size: 1.1rem;
      margin: 1.5rem 0;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.5;
    }

    button {
      margin-top: 1rem;
      gap: 0.5rem;
    }

    [data-theme="dark"] .not-found-icon {
      color: rgba(255, 255, 255, 0.4);
    }

    [data-theme="dark"] h2 {
      color: rgba(255, 255, 255, 0.7);
    }

    [data-theme="dark"] p {
      color: rgba(255, 255, 255, 0.6);
    }
  `]
})
export class NotFoundComponent {}