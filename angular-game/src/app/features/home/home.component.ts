import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Apprenez les langues avec l'IA</h1>
          <p class="hero-subtitle">
            Dialect Game utilise l'intelligence artificielle et la reconnaissance vocale 
            pour vous offrir une expérience d'apprentissage personnalisée et interactive.
          </p>
          
          <div class="hero-actions">
            <ng-container *ngIf="authService.isAuthenticated(); else guestActions">
              <button mat-raised-button color="primary" size="large" routerLink="/lessons">
                <mat-icon>play_arrow</mat-icon>
                Continuer l'apprentissage
              </button>
              <button mat-button routerLink="/progress">
                Voir ma progression
              </button>
            </ng-container>
            
            <ng-template #guestActions>
              <button mat-raised-button color="primary" size="large" routerLink="/auth/register">
                <mat-icon>school</mat-icon>
                Commencer gratuitement
              </button>
              <button mat-button routerLink="/auth/login">
                Déjà inscrit ? Se connecter
              </button>
            </ng-template>
          </div>
        </div>
        
        <div class="hero-image">
          <img src="/assets/images/hero-illustration.svg" alt="Apprentissage des langues" />
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="section-header">
          <h2>Pourquoi choisir Dialect Game ?</h2>
          <p>Une approche moderne de l'apprentissage des langues</p>
        </div>
        
        <div class="features-grid">
          <mat-card class="feature-card">
            <mat-card-content>
              <mat-icon class="feature-icon">mic</mat-icon>
              <h3>Reconnaissance vocale</h3>
              <p>Améliorez votre prononciation avec notre système de reconnaissance vocale avancé et obtenez des retours en temps réel.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="feature-card">
            <mat-card-content>
              <mat-icon class="feature-icon">psychology</mat-icon>
              <h3>IA conversationnelle</h3>
              <p>Pratiquez des conversations naturelles avec notre IA qui s'adapte à votre niveau et vous corrige de manière bienveillante.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="feature-card">
            <mat-card-content>
              <mat-icon class="feature-icon">trending_up</mat-icon>
              <h3>Apprentissage adaptatif</h3>
              <p>Notre système ajuste automatiquement la difficulté selon vos progrès pour un apprentissage optimal.</p>
            </mat-card-content>
          </mat-card>
          
          <mat-card class="feature-card">
            <mat-card-content>
              <mat-icon class="feature-icon">devices</mat-icon>
              <h3>Multi-plateforme</h3>
              <p>Apprenez où que vous soyez, sur tous vos appareils. Synchronisation automatique de vos progrès.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Learning Path Section -->
      <section class="learning-path-section" *ngIf="!authService.isAuthenticated()">
        <div class="section-header">
          <h2>Comment ça marche ?</h2>
          <p>4 étapes simples pour maîtriser une langue</p>
        </div>
        
        <div class="steps-container">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Situation</h3>
            <p>Découvrez le contexte et la motivation de la leçon</p>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <h3>Vocabulaire</h3>
            <p>Apprenez les mots clés avec la prononciation</p>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <h3>Exercices</h3>
            <p>Pratiquez avec des exercices interactifs</p>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <h3>Intégration</h3>
            <p>Mettez en pratique dans une conversation</p>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section" *ngIf="!authService.isAuthenticated()">
        <div class="cta-content">
          <h2>Prêt à commencer votre aventure linguistique ?</h2>
          <p>Rejoignez des milliers d'apprenants qui font confiance à Dialect Game</p>
          <button mat-raised-button color="accent" size="large" routerLink="/auth/register">
            <mat-icon>rocket_launch</mat-icon>
            Commencer maintenant
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 64px);
    }

    .hero-section {
      display: flex;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .hero-content {
      flex: 1;
      max-width: 600px;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 300;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .hero-image {
      flex: 1;
      text-align: center;
      padding-left: 2rem;
    }

    .hero-image img {
      max-width: 100%;
      height: auto;
    }

    .features-section, .learning-path-section, .cta-section {
      padding: 4rem 2rem;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .section-header p {
      font-size: 1.1rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      text-align: center;
      padding: 1rem;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
    }

    .feature-icon {
      font-size: 3rem;
      color: #3f51b5;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      margin: 1rem 0;
      font-size: 1.3rem;
    }

    .steps-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      max-width: 1000px;
      margin: 0 auto;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .step {
      text-align: center;
      max-width: 200px;
    }

    .step-number {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #3f51b5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0 auto 1rem;
    }

    .cta-section {
      background: #f5f5f5;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      color: rgba(0, 0, 0, 0.7);
    }

    @media (max-width: 768px) {
      .hero-section {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
      }

      .hero-image {
        padding-left: 0;
        margin-top: 2rem;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-actions {
        justify-content: center;
      }

      .features-section, .learning-path-section, .cta-section {
        padding: 2rem 1rem;
      }

      .steps-container {
        flex-direction: column;
      }
    }

    [data-theme="dark"] .section-header p {
      color: rgba(255, 255, 255, 0.6);
    }

    [data-theme="dark"] .cta-section {
      background: #1e1e1e;
    }

    [data-theme="dark"] .cta-content p {
      color: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class HomeComponent {
  constructor(public authService: AuthService) {}
}