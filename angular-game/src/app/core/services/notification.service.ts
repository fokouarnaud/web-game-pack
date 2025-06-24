import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      ...config,
      duration: 8000, // Longer duration for errors
      panelClass: ['error-snackbar']
    });
  }

  showWarning(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['warning-snackbar']
    });
  }

  showInfo(message: string, config?: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Fermer', {
      ...this.defaultConfig,
      ...config,
      panelClass: ['info-snackbar']
    });
  }
}