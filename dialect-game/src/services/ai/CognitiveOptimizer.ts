/**
 * CognitiveOptimizer - Phase REFACTOR TDD
 * Implémentation enrichie avec neurofeedback adaptatif avancé
 */
export class CognitiveOptimizer {
  private readonly cognitiveStates = {
    focused: { threshold: 0.7, optimal: true },
    relaxed: { threshold: 0.4, optimal: false },
    stressed: { threshold: 0.8, optimal: false },
    fatigued: { threshold: 0.3, optimal: false },
    distracted: { threshold: 0.5, optimal: false }
  };

  private readonly feedbackStrategies = {
    break: ['Take a short break', 'Rest for 5-10 minutes', 'Step away from learning'],
    refocus: ['Try a breathing exercise', 'Clear your workspace', 'Set a specific goal'],
    energize: ['Do light physical activity', 'Drink water', 'Change your environment'],
    simplify: ['Try easier content', 'Break task into smaller steps', 'Use visual aids'],
    challenge: ['Try more difficult content', 'Set a time challenge', 'Add gamification']
  };

  async generateFeedback(userProfile: any): Promise<string> {
    if (!userProfile || !userProfile.id) {
      throw new Error('Invalid user profile');
    }

    // Analyse de l'état cognitif actuel
    const cognitiveState = this.analyzeCognitiveState(userProfile);
    
    // Analyse des patterns d'apprentissage
    const learningPattern = this.analyzeLearningPattern(userProfile);
    
    // Détection de fatigue ou surcharge cognitive
    const fatigueLevel = this.detectFatigueLevel(userProfile);
    
    // Génération du feedback adaptatif
    const feedback = this.generateAdaptiveFeedback(cognitiveState, learningPattern, fatigueLevel, userProfile);
    
    return feedback;
  }

  private analyzeCognitiveState(userProfile: any): string {
    const brainwaveData = userProfile.brainwaveData || [];
    const reactionTimes = userProfile.reactionTimes || [];
    const errorRate = userProfile.errorRate || 0;
    
    // Analyse des ondes cérébrales (simulation)
    const avgBrainwaveActivity = brainwaveData.length > 0
      ? brainwaveData.reduce((sum: number, val: number) => sum + val, 0) / brainwaveData.length
      : 0.5;
    
    // Analyse des temps de réaction
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((sum: number, val: number) => sum + val, 0) / reactionTimes.length
      : 1000;
    
    // Classification de l'état cognitif
    if (avgBrainwaveActivity > 0.7 && avgReactionTime < 800) {
      return 'focused';
    } else if (avgBrainwaveActivity > 0.8 || errorRate > 0.3) {
      return 'stressed';
    } else if (avgBrainwaveActivity < 0.3 || avgReactionTime > 1500) {
      return 'fatigued';
    } else if (errorRate > 0.2 && avgReactionTime > 1200) {
      return 'distracted';
    } else {
      return 'relaxed';
    }
  }

  private analyzeLearningPattern(userProfile: any): any {
    const sessionDuration = userProfile.currentSessionDuration || 0;
    const completionRate = userProfile.completionRate || 0;
    const difficultyPreference = userProfile.difficultyPreference || 'medium';
    const learningStyle = userProfile.learningStyle || 'visual';
    
    return {
      sessionLength: this.categorizeSessionLength(sessionDuration),
      performance: this.categorizePerformance(completionRate),
      preferredDifficulty: difficultyPreference,
      learningStyle: learningStyle,
      momentum: this.calculateLearningMomentum(userProfile)
    };
  }

  private detectFatigueLevel(userProfile: any): number {
    const sessionDuration = userProfile.currentSessionDuration || 0;
    const consecutiveSessions = userProfile.consecutiveSessions || 0;
    const timeOfDay = new Date().getHours();
    const recentPerformance = userProfile.recentPerformance || [];
    
    let fatigueScore = 0;
    
    // Fatigue basée sur la durée de session
    if (sessionDuration > 3600) fatigueScore += 0.3; // > 1h
    if (sessionDuration > 7200) fatigueScore += 0.2; // > 2h
    
    // Fatigue basée sur les sessions consécutives
    fatigueScore += Math.min(0.3, consecutiveSessions * 0.1);
    
    // Fatigue basée sur l'heure (pic de fatigue 14h-16h)
    if (timeOfDay >= 14 && timeOfDay <= 16) fatigueScore += 0.1;
    if (timeOfDay >= 22 || timeOfDay <= 6) fatigueScore += 0.2;
    
    // Fatigue basée sur la dégradation des performances
    if (recentPerformance.length >= 3) {
      const trend = this.calculatePerformanceTrend(recentPerformance);
      if (trend < -0.1) fatigueScore += 0.2;
    }
    
    return Math.min(1.0, fatigueScore);
  }

  private generateAdaptiveFeedback(cognitiveState: string, learningPattern: any, fatigueLevel: number, userProfile: any): string {
    // Feedback prioritaire en cas de fatigue élevée
    if (fatigueLevel > 0.7) {
      return this.getRandomFeedback('break') + ' Your cognitive load is high.';
    }
    
    // Feedback basé sur l'état cognitif
    switch (cognitiveState) {
      case 'focused':
        if (learningPattern.momentum > 0.8) {
          return this.getRandomFeedback('challenge') + ' You\'re in the zone!';
        }
        return 'Great focus! Keep up the excellent work.';
        
      case 'stressed':
        return this.getRandomFeedback('refocus') + ' Let\'s reduce the pressure.';
        
      case 'fatigued':
        return this.getRandomFeedback('energize') + ' Your energy levels seem low.';
        
      case 'distracted':
        return this.getRandomFeedback('refocus') + ' Let\'s get back on track.';
        
      case 'relaxed':
        if (learningPattern.performance < 0.6) {
          return this.getRandomFeedback('challenge') + ' Ready for more challenge?';
        }
        return 'You\'re in a good learning state. Continue at your pace.';
        
      default:
        return this.getPersonalizedFeedback(userProfile);
    }
  }

  private getPersonalizedFeedback(userProfile: any): string {
    const preferences = userProfile.preferences || {};
    const learningStyle: string = userProfile.learningStyle || 'visual';
    
    const personalizedFeedbacks: { [key: string]: string } = {
      visual: 'Try using diagrams or mind maps for this concept.',
      auditory: 'Consider listening to explanations or discussing concepts aloud.',
      kinesthetic: 'Try hands-on practice or real-world examples.',
      reading: 'Reading additional materials might help solidify your understanding.'
    };
    
    return personalizedFeedbacks[learningStyle] || 'Adjust your learning approach based on what works best for you.';
  }

  private getRandomFeedback(strategy: keyof typeof this.feedbackStrategies): string {
    const options = this.feedbackStrategies[strategy];
    return options[Math.floor(Math.random() * options.length)];
  }

  private categorizeSessionLength(duration: number): string {
    if (duration < 900) return 'short';      // < 15 min
    if (duration < 2700) return 'medium';    // < 45 min
    if (duration < 5400) return 'long';      // < 1.5h
    return 'extended';                       // > 1.5h
  }

  private categorizePerformance(completionRate: number): string {
    if (completionRate > 0.8) return 'excellent';
    if (completionRate > 0.6) return 'good';
    if (completionRate > 0.4) return 'moderate';
    return 'needs_improvement';
  }

  private calculateLearningMomentum(userProfile: any): number {
    const recentScores = userProfile.recentScores || [];
    const sessionConsistency = userProfile.sessionConsistency || 0;
    const engagementLevel = userProfile.engagementLevel || 0;
    
    if (recentScores.length === 0) return 0.5;
    
    // Tendance des scores récents
    const scoreTrend = this.calculatePerformanceTrend(recentScores);
    
    // Momentum composite
    const momentum = (scoreTrend + sessionConsistency + engagementLevel) / 3;
    
    return Math.max(0, Math.min(1, momentum));
  }

  private calculatePerformanceTrend(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }

  // Méthodes avancées pour optimisation cognitive
  async generateDetailedCognitiveReport(userProfile: any): Promise<any> {
    const cognitiveState = this.analyzeCognitiveState(userProfile);
    const learningPattern = this.analyzeLearningPattern(userProfile);
    const fatigueLevel = this.detectFatigueLevel(userProfile);
    
    return {
      currentState: cognitiveState,
      fatigueLevel: fatigueLevel,
      learningPattern: learningPattern,
      recommendations: this.generateCognitiveRecommendations(cognitiveState, fatigueLevel),
      optimalLearningWindow: this.predictOptimalLearningWindow(userProfile),
      cognitiveLoadAssessment: this.assessCognitiveLoad(userProfile)
    };
  }

  private generateCognitiveRecommendations(state: string, fatigueLevel: number): string[] {
    const recommendations: string[] = [];
    
    if (fatigueLevel > 0.5) {
      recommendations.push('Consider shorter learning sessions');
      recommendations.push('Take regular breaks every 25-30 minutes');
    }
    
    if (state === 'stressed') {
      recommendations.push('Practice relaxation techniques before learning');
      recommendations.push('Reduce session complexity');
    }
    
    if (state === 'focused') {
      recommendations.push('Maximize this optimal state with challenging content');
      recommendations.push('Extend session if comfortable');
    }
    
    return recommendations;
  }

  private predictOptimalLearningWindow(userProfile: any): any {
    const historicalPerformance = userProfile.historicalPerformance || [];
    const timePreferences = userProfile.timePreferences || {};
    
    // Analyse simple basée sur les patterns historiques
    const optimalHours = timePreferences.preferredHours || [9, 10, 11, 14, 15, 16];
    
    return {
      nextOptimalTime: this.calculateNextOptimalTime(optimalHours),
      sessionDuration: this.recommendSessionDuration(userProfile),
      difficultyLevel: this.recommendDifficultyLevel(userProfile)
    };
  }

  private assessCognitiveLoad(userProfile: any): any {
    const currentTasks = userProfile.currentTasks || [];
    const multitaskingLevel = userProfile.multitaskingLevel || 0;
    const concentrationSpan = userProfile.concentrationSpan || 1800; // 30 min default
    
    return {
      currentLoad: this.calculateCurrentCognitiveLoad(currentTasks, multitaskingLevel),
      capacity: concentrationSpan,
      recommendation: this.recommendCognitiveLoadAdjustment(currentTasks.length, multitaskingLevel)
    };
  }

  private calculateNextOptimalTime(optimalHours: number[]): Date {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Trouve la prochaine heure optimale
    const nextHour = optimalHours.find(hour => hour > currentHour) || optimalHours[0];
    
    const nextOptimal = new Date(now);
    if (nextHour <= currentHour) {
      nextOptimal.setDate(nextOptimal.getDate() + 1);
    }
    nextOptimal.setHours(nextHour, 0, 0, 0);
    
    return nextOptimal;
  }

  private recommendSessionDuration(userProfile: any): number {
    const averageSessionDuration = userProfile.averageSessionDuration || 1800;
    const performanceByDuration = userProfile.performanceByDuration || {};
    
    // Trouve la durée optimale basée sur les performances historiques
    let optimalDuration = averageSessionDuration;
    let bestPerformance = 0;
    
    Object.entries(performanceByDuration).forEach(([duration, performance]) => {
      if ((performance as number) > bestPerformance) {
        bestPerformance = performance as number;
        optimalDuration = parseInt(duration);
      }
    });
    
    return Math.min(3600, Math.max(900, optimalDuration)); // Entre 15 min et 1h
  }

  private recommendDifficultyLevel(userProfile: any): string {
    const cognitiveState = this.analyzeCognitiveState(userProfile);
    const recentPerformance = userProfile.recentPerformance || [];
    
    if (cognitiveState === 'focused' && recentPerformance.length > 0) {
      const avgPerformance = recentPerformance.reduce((sum: number, perf: number) => sum + perf, 0) / recentPerformance.length;
      if (avgPerformance > 0.8) return 'challenging';
      if (avgPerformance > 0.6) return 'moderate';
    }
    
    return 'easy';
  }

  private calculateCurrentCognitiveLoad(tasks: any[], multitaskingLevel: number): number {
    const baseLoad = tasks.length * 0.2;
    const multitaskingPenalty = multitaskingLevel * 0.3;
    
    return Math.min(1.0, baseLoad + multitaskingPenalty);
  }

  private recommendCognitiveLoadAdjustment(taskCount: number, multitaskingLevel: number): string {
    if (taskCount > 3) return 'Reduce number of concurrent learning tasks';
    if (multitaskingLevel > 0.7) return 'Focus on single-task learning';
    return 'Current cognitive load is manageable';
  }
}