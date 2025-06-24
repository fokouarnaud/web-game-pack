/**
 * useGameLessonNavigation - Hook utilitaire pour la navigation dans les leçons
 * Centralise la logique de navigation commune entre les composants game-lesson
 * Gère la validation des paramètres et la construction sécurisée des URLs
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface LessonCompleteParams {
  status: 'success' | 'failure';
  lessonId?: string;
  chapterNumber?: number;
  score?: number;
  accuracy?: number;
  type?: 'educational' | 'simple' | 'advanced' | 'zen' | 'situation';
}

export const useGameLessonNavigation = () => {
  const navigate = useNavigate();

  /**
   * Navigation sécurisée vers la page de completion de leçon
   * Valide les paramètres et construit l'URL de manière sécurisée
   */
  const navigateToLessonComplete = useCallback((params: LessonCompleteParams) => {
    try {
      // Validation des paramètres obligatoires
      if (!params.status) {
        console.error('useGameLessonNavigation: status is required');
        return false;
      }

      // Construction sécurisée des paramètres de requête
      const searchParams = new URLSearchParams();
      
      // Paramètres obligatoires
      searchParams.set('status', params.status);
      
      // Paramètres optionnels avec validation
      if (params.lessonId && typeof params.lessonId === 'string') {
        searchParams.set('lessonId', params.lessonId);
      }
      
      if (params.chapterNumber && typeof params.chapterNumber === 'number' && params.chapterNumber > 0) {
        searchParams.set('chapterNumber', params.chapterNumber.toString());
      }
      
      if (params.score && typeof params.score === 'number' && params.score >= 0) {
        searchParams.set('score', params.score.toString());
      }
      
      if (params.accuracy && typeof params.accuracy === 'number' && params.accuracy >= 0 && params.accuracy <= 100) {
        searchParams.set('accuracy', Math.round(params.accuracy).toString());
      }
      
      if (params.type && typeof params.type === 'string') {
        searchParams.set('type', params.type);
      }

      // Déterminer la route de destination selon le type
      let destinationRoute = '/lesson-complete';
      if (params.type === 'educational') {
        destinationRoute = '/lesson-complete-educational';
      }

      // Construction de l'URL finale
      const finalUrl = `${destinationRoute}?${searchParams.toString()}`;
      
      // Navigation avec gestion d'erreur
      navigate(finalUrl);
      
      return true;
      
    } catch (error) {
      console.error('useGameLessonNavigation: Navigation error', error);
      
      // Navigation de fallback vers la page des leçons
      try {
        navigate('/lessons');
      } catch (fallbackError) {
        console.error('useGameLessonNavigation: Fallback navigation failed', fallbackError);
      }
      
      return false;
    }
  }, [navigate]);

  /**
   * Navigation simple vers la liste des leçons
   */
  const navigateToLessons = useCallback(() => {
    try {
      navigate('/lessons');
      return true;
    } catch (error) {
      console.error('useGameLessonNavigation: Failed to navigate to lessons', error);
      return false;
    }
  }, [navigate]);

  /**
   * Navigation vers une leçon spécifique
   */
  const navigateToLesson = useCallback((lessonId: string, chapterNumber?: number) => {
    try {
      if (!lessonId || typeof lessonId !== 'string') {
        console.error('useGameLessonNavigation: Valid lessonId is required');
        return false;
      }

      const searchParams = new URLSearchParams();
      if (chapterNumber && typeof chapterNumber === 'number' && chapterNumber > 0) {
        searchParams.set('chapterNumber', chapterNumber.toString());
      }

      const url = `/lesson/${lessonId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      navigate(url);
      
      return true;
      
    } catch (error) {
      console.error('useGameLessonNavigation: Failed to navigate to lesson', error);
      return false;
    }
  }, [navigate]);

  return {
    navigateToLessonComplete,
    navigateToLessons,
    navigateToLesson
  };
};

export default useGameLessonNavigation;