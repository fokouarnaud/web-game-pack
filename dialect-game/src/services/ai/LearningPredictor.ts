/**
 * LearningPredictor - Phase REFACTOR TDD
 * Implémentation enrichie avec algorithmes prédictifs avancés
 */
export class LearningPredictor {
  private readonly activityWeights: { [key: string]: number } = {
    'lesson': 1.0,
    'quiz': 1.2,
    'conversation': 1.5,
    'game': 0.8,
    'review': 0.6
  };

  async predictNextActivity(userProfile: any): Promise<string> {
    if (!userProfile || !userProfile.id) {
      throw new Error('Invalid user profile');
    }

    const history = userProfile.history || [];
    const preferences = userProfile.preferences || {};
    const weaknesses = userProfile.weaknesses || [];
    
    // Analyse des patterns d'apprentissage
    const activityPattern = this.analyzeActivityPattern(history);
    const difficultyLevel = this.calculateOptimalDifficulty(userProfile);
    
    // Prédiction basée sur l'historique et les préférences
    const nextActivity = this.generateNextActivity(activityPattern, difficultyLevel, weaknesses, preferences);
    
    return nextActivity;
  }

  async predictRetention(userProfile: any): Promise<number> {
    if (!userProfile || !userProfile.id) {
      throw new Error('Invalid user profile');
    }

    const history = userProfile.history || [];
    const sessionFrequency = this.calculateSessionFrequency(history);
    const averageScore = this.calculateAverageScore(userProfile.scores || []);
    const engagementLevel = this.calculateEngagementLevel(userProfile);
    
    // Algorithme de prédiction de rétention
    const baseRetention = 0.5;
    const frequencyBonus = Math.min(0.3, sessionFrequency * 0.1);
    const scoreBonus = Math.min(0.2, (averageScore - 0.5) * 0.4);
    const engagementBonus = Math.min(0.2, engagementLevel * 0.2);
    
    const retentionProbability = baseRetention + frequencyBonus + scoreBonus + engagementBonus;
    
    return Math.min(0.99, Math.max(0.01, retentionProbability));
  }

  private analyzeActivityPattern(history: string[]): any {
    const activityCount: { [key: string]: number } = {};
    const recentHistory = history.slice(-10); // Dernières 10 activités
    
    recentHistory.forEach(activity => {
      const type = this.extractActivityType(activity);
      activityCount[type] = (activityCount[type] || 0) + 1;
    });
    
    return {
      preferredTypes: Object.keys(activityCount).sort((a, b) => activityCount[b] - activityCount[a]),
      diversity: Object.keys(activityCount).length,
      totalActivities: recentHistory.length
    };
  }

  private calculateOptimalDifficulty(userProfile: any): number {
    const scores = userProfile.scores || [];
    if (scores.length === 0) return 0.5;
    
    const recentScores = scores.slice(-5);
    const averageScore = recentScores.reduce((sum: number, score: number) => sum + score, 0) / recentScores.length;
    
    // Ajustement de difficulté basé sur les performances
    if (averageScore > 0.8) return Math.min(1.0, userProfile.currentDifficulty + 0.1);
    if (averageScore < 0.6) return Math.max(0.1, userProfile.currentDifficulty - 0.1);
    return userProfile.currentDifficulty || 0.5;
  }

  private generateNextActivity(pattern: any, difficulty: number, weaknesses: string[], preferences: any): string {
    // Priorité aux faiblesses détectées
    if (weaknesses.length > 0) {
      const weakness = weaknesses[0];
      return this.getActivityForWeakness(weakness, difficulty);
    }
    
    // Sinon, basé sur les préférences et patterns
    const preferredType = pattern.preferredTypes[0] || 'lesson';
    const difficultyLevel = Math.ceil(difficulty * 10);
    
    return `${preferredType}${difficultyLevel}`;
  }

  private getActivityForWeakness(weakness: string, difficulty: number): string {
    const activityMap: { [key: string]: string } = {
      'grammar': 'grammar_drill',
      'listening': 'audio_exercise',
      'speaking': 'pronunciation_practice',
      'vocabulary': 'word_association',
      'reading': 'comprehension_test'
    };
    
    const baseActivity = activityMap[weakness] || 'lesson';
    const difficultyLevel = Math.ceil(difficulty * 10);
    
    return `${baseActivity}_${difficultyLevel}`;
  }

  private calculateSessionFrequency(history: string[]): number {
    if (history.length < 2) return 0;
    
    // Simulation de fréquence basée sur l'historique
    const sessionCount = history.length;
    const daysSinceStart = 30; // Simulation de 30 jours
    
    return Math.min(1.0, sessionCount / daysSinceStart);
  }

  private calculateAverageScore(scores: number[]): number {
    if (scores.length === 0) return 0.5;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateEngagementLevel(userProfile: any): number {
    const factors = {
      sessionDuration: userProfile.averageSessionDuration || 0,
      completionRate: userProfile.completionRate || 0,
      consecutiveDays: userProfile.consecutiveDays || 0
    };
    
    // Normalisation des facteurs
    const normalizedDuration = Math.min(1.0, factors.sessionDuration / 1800); // 30 min = 1.0
    const normalizedCompletion = factors.completionRate;
    const normalizedConsecutive = Math.min(1.0, factors.consecutiveDays / 7); // 7 jours = 1.0
    
    return (normalizedDuration + normalizedCompletion + normalizedConsecutive) / 3;
  }

  private extractActivityType(activity: string): string {
    // Extraction du type d'activité à partir du nom
    const types = ['lesson', 'quiz', 'conversation', 'game', 'review'];
    for (const type of types) {
      if (activity.toLowerCase().includes(type)) {
        return type;
      }
    }
    return 'lesson'; // Par défaut
  }
}