import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-overlay">
      <div class="loading-content">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="loading-text">Chargement...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .loading-text {
      margin-top: 1rem;
      margin-bottom: 0;
      font-size: 1rem;
      color: rgba(0, 0, 0, 0.7);
    }

    [data-theme="dark"] .loading-content {
      background: #424242;
      color: white;
    }

    [data-theme="dark"] .loading-text {
      color: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class LoadingSpinnerComponent {}