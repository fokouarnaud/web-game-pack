import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('@features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'lessons',
    loadChildren: () => import('@features/lessons/lessons.routes').then(m => m.lessonRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'lesson/:id',
    loadComponent: () => import('@features/lesson-player/lesson-player.component').then(m => m.LessonPlayerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'progress',
    loadComponent: () => import('@features/progress/progress.component').then(m => m.ProgressComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('@features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('@shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];