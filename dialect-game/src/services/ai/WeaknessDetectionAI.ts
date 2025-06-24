/**
 * WeaknessDetectionAI - Phase REFACTOR TDD
 * Implémentation enrichie avec algorithmes de détection avancés
 */
export class WeaknessDetectionAI {
  private readonly skillAreas = [
    'grammar', 'vocabulary', 'listening', 'speaking',
    'reading', 'writing', 'pronunciation', 'comprehension'
  ];

  private readonly weaknessThresholds = {
    critical: 0.4,    // Score < 40%
    moderate: 0.6,    // Score < 60%
    minor: 0.75       // Score < 75%
  };

  async detectWeaknesses(activityData: any): Promise<string[]> {
    if (!activityData) {
      throw new Error('Invalid activity data');
    }

    if (!activityData.userId || !activityData.scores) {
      throw new Error('Activity data must contain userId and scores');
    }

    const skillAnalysis = this.analyzeSkillPerformance(activityData);
    const temporalAnalysis = this.analyzeTemporalPatterns(activityData);
    const contextualAnalysis = this.analyzeContextualWeaknesses(activityData);
    
    // Combinaison des analyses pour identification des faiblesses
    const detectedWeaknesses = this.combineAnalyses(skillAnalysis, temporalAnalysis, contextualAnalysis);
    
    // Priorisation des faiblesses par criticité
    const prioritizedWeaknesses = this.prioritizeWeaknesses(detectedWeaknesses);
    
    return prioritizedWeaknesses;
  }

  private analyzeSkillPerformance(activityData: any): any {
    const scores = activityData.scores || [];
    const skillBreakdown = activityData.skillBreakdown || {};
    
    const weakSkills: { [key: string]: number } = {};
    
    // Analyse des scores globaux
    const averageScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    
    // Analyse par domaine de compétence
    this.skillAreas.forEach(skill => {
      const skillScores = skillBreakdown[skill] || [];
      if (skillScores.length > 0) {
        const skillAverage = skillScores.reduce((sum: number, score: number) => sum + score, 0) / skillScores.length;
        
        // Détection de faiblesse relative
        if (skillAverage < averageScore * 0.8) {
          weakSkills[skill] = this.calculateWeaknessLevel(skillAverage);
        }
      }
    });
    
    return { weakSkills, averageScore };
  }

  private analyzeTemporalPatterns(activityData: any): any {
    const timestamps = activityData.timestamps || [];
    const scores = activityData.scores || [];
    
    if (timestamps.length !== scores.length) {
      return { trend: 'stable', recentPerformance: 'unknown' };
    }
    
    // Analyse de tendance récente (derniers 20%)
    const recentCount = Math.max(1, Math.floor(scores.length * 0.2));
    const recentScores = scores.slice(-recentCount);
    const olderScores = scores.slice(0, -recentCount);
    
    const recentAverage = recentScores.reduce((sum: number, score: number) => sum + score, 0) / recentScores.length;
    const olderAverage = olderScores.length > 0
      ? olderScores.reduce((sum: number, score: number) => sum + score, 0) / olderScores.length
      : recentAverage;
    
    const trend = this.calculateTrend(recentAverage, olderAverage);
    
    return {
      trend,
      recentPerformance: recentAverage,
      degradationRate: olderAverage - recentAverage
    };
  }

  private analyzeContextualWeaknesses(activityData: any): any {
    const contexts = activityData.contexts || [];
    const scores = activityData.scores || [];
    
    const contextualPerformance: { [key: string]: number[] } = {};
    
    // Groupement des scores par contexte
    contexts.forEach((context: string, index: number) => {
      if (scores[index] !== undefined) {
        if (!contextualPerformance[context]) {
          contextualPerformance[context] = [];
        }
        contextualPerformance[context].push(scores[index]);
      }
    });
    
    // Identification des contextes problématiques
    const problematicContexts: string[] = [];
    const globalAverage = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
    
    Object.entries(contextualPerformance).forEach(([context, ctxScores]) => {
      const contextAverage = ctxScores.reduce((sum, score) => sum + score, 0) / ctxScores.length;
      
      if (contextAverage < globalAverage * 0.85) {
        problematicContexts.push(context);
      }
    });
    
    return { problematicContexts, contextualPerformance };
  }

  private combineAnalyses(skillAnalysis: any, temporalAnalysis: any, contextualAnalysis: any): string[] {
    const weaknesses: string[] = [];
    
    // Faiblesses basées sur les compétences
    Object.entries(skillAnalysis.weakSkills).forEach(([skill, level]) => {
      if ((level as number) > this.weaknessThresholds.moderate) {
        weaknesses.push(skill);
      }
    });
    
    // Faiblesses basées sur la dégradation temporelle
    if (temporalAnalysis.trend === 'declining' && temporalAnalysis.degradationRate > 0.1) {
      // Identifier les domaines en déclin
      weaknesses.push('consistency');
    }
    
    // Faiblesses contextuelles
    contextualAnalysis.problematicContexts.forEach((context: string) => {
      const mappedSkill = this.mapContextToSkill(context);
      if (mappedSkill && !weaknesses.includes(mappedSkill)) {
        weaknesses.push(mappedSkill);
      }
    });
    
    // Retour par défaut si aucune faiblesse spécifique détectée
    if (weaknesses.length === 0 && skillAnalysis.averageScore < this.weaknessThresholds.moderate) {
      return ['grammar', 'listening']; // Faiblesses les plus communes
    }
    
    return weaknesses;
  }

  private prioritizeWeaknesses(weaknesses: string[]): string[] {
    // Priorisation basée sur l'impact pédagogique
    const priorityOrder = [
      'grammar',      // Fondamental pour structure
      'vocabulary',   // Base du langage
      'listening',    // Compréhension orale
      'pronunciation', // Communication
      'speaking',     // Expression orale
      'reading',      // Compréhension écrite
      'writing',      // Expression écrite
      'comprehension' // Compréhension globale
    ];
    
    return weaknesses.sort((a, b) => {
      const indexA = priorityOrder.indexOf(a);
      const indexB = priorityOrder.indexOf(b);
      
      // Les éléments non trouvés vont à la fin
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      return indexA - indexB;
    });
  }

  private calculateWeaknessLevel(score: number): number {
    if (score < this.weaknessThresholds.critical) return 1.0;
    if (score < this.weaknessThresholds.moderate) return 0.7;
    if (score < this.weaknessThresholds.minor) return 0.4;
    return 0.0;
  }

  private calculateTrend(recent: number, older: number): string {
    const difference = recent - older;
    const threshold = 0.05;
    
    if (difference > threshold) return 'improving';
    if (difference < -threshold) return 'declining';
    return 'stable';
  }

  private mapContextToSkill(context: string): string | null {
    const contextMapping: { [key: string]: string } = {
      'conversation': 'speaking',
      'audio': 'listening',
      'text': 'reading',
      'quiz': 'comprehension',
      'writing_exercise': 'writing',
      'pronunciation_drill': 'pronunciation',
      'vocabulary_test': 'vocabulary',
      'grammar_exercise': 'grammar'
    };
    
    return contextMapping[context] || null;
  }

  // Méthodes utilitaires pour analyse approfondie
  async generateWeaknessReport(activityData: any): Promise<any> {
    const weaknesses = await this.detectWeaknesses(activityData);
    
    return {
      detectedWeaknesses: weaknesses,
      recommendedActions: this.generateRecommendations(weaknesses),
      severity: this.assessSeverity(weaknesses, activityData),
      estimatedImprovementTime: this.estimateImprovementTime(weaknesses)
    };
  }

  private generateRecommendations(weaknesses: string[]): string[] {
    const recommendations: { [key: string]: string } = {
      'grammar': 'Focus on sentence structure exercises and tense practice',
      'vocabulary': 'Daily word learning with spaced repetition',
      'listening': 'Increase audio exposure with varied accents',
      'speaking': 'Practice speaking exercises with feedback',
      'reading': 'Read texts at appropriate difficulty level',
      'writing': 'Structured writing practice with corrections',
      'pronunciation': 'Phonetic exercises and recorded practice',
      'comprehension': 'Multi-modal comprehension activities'
    };
    
    return weaknesses.map(weakness => recommendations[weakness] || 'General practice recommended');
  }

  private assessSeverity(weaknesses: string[], activityData: any): string {
    const criticalAreas = ['grammar', 'vocabulary', 'comprehension'];
    const hasCriticalWeakness = weaknesses.some(w => criticalAreas.includes(w));
    
    if (weaknesses.length > 4) return 'high';
    if (hasCriticalWeakness && weaknesses.length > 2) return 'moderate';
    return 'low';
  }

  private estimateImprovementTime(weaknesses: string[]): { [key: string]: string } {
    const timeEstimates: { [key: string]: string } = {
      'grammar': '4-6 weeks',
      'vocabulary': '2-4 weeks',
      'listening': '3-5 weeks',
      'speaking': '6-8 weeks',
      'reading': '3-4 weeks',
      'writing': '5-7 weeks',
      'pronunciation': '8-12 weeks',
      'comprehension': '4-6 weeks'
    };
    
    const result: { [key: string]: string } = {};
    weaknesses.forEach(weakness => {
      result[weakness] = timeEstimates[weakness] || '4-6 weeks';
    });
    
    return result;
  }
}