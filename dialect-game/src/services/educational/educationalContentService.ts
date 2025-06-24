// Temporairement désactivé pour correction TypeScript
console.warn('Service educationalContentService temporairement désactivé');

// Service par défaut temporaire
class EducationalContentService {
  constructor() {
    console.log('EducationalContentService initialisé (mode désactivé)');
  }

  // Méthodes basiques pour éviter les erreurs
  getAllLessons() {
    return [];
  }

  getLesson(id: string) {
    return null;
  }

  getAllExercises() {
    return [];
  }

  getExercise(id: string) {
    return null;
  }

  getDictionary() {
    return null;
  }

  getCommonPhrases() {
    return null;
  }

  getSRSSystem() {
    return null;
  }

  getUserPreferences() {
    return null;
  }
}

export const educationalContentService = new EducationalContentService();
export default educationalContentService;