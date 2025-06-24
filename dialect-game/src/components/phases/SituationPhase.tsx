import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Target, Heart, MapPin } from 'lucide-react';
import type { LessonData } from '@/data/lessonData';
import { useGameLessonState } from '@/hooks/useGameLessonState';
import { AutoScrollContainer } from '@/components/common/AutoScrollContainer';

interface SituationPhaseProps {
  lessonData: LessonData;
}

export const SituationPhase: React.FC<SituationPhaseProps> = ({ lessonData }) => {
  const { updatePhase, updateProgress } = useGameLessonState();
  
  const handleNext = () => {
    console.log('[SituationPhase] Navigating to vocabulary phase');
    updatePhase('vocabulary', 0);
    updateProgress(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* En-tête compact */}
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 rounded-full flex items-center justify-center shadow-lg">
            <Lightbulb className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">💡</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent mb-3">
          Situation-Problème
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          {lessonData.situation.context}
        </p>
      </div>

      {/* Carte principale compacte */}
      <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/10 border-0 shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6">
            
            {/* Section Défi */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                  🎯 Votre défi
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lessonData.situation.problem}
                </p>
              </div>
            </div>

            {/* Section Motivation */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                  💡 Pourquoi c'est important
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lessonData.situation.motivation}
                </p>
              </div>
            </div>

            {/* Section Contexte */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                  🌍 Contexte
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Vous êtes sur le point de vivre une expérience d'apprentissage interactive qui vous préparera pour des situations réelles.
                </p>
              </div>
            </div>

            {/* Action avec scroll automatique */}
            <AutoScrollContainer shouldScroll={true} className="text-center pt-4">
              <Button 
                onClick={handleNext} 
                size="lg" 
                data-cta-button
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                <span className="mr-2">Commencer l'apprentissage</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              
              {/* Indicateur de progression compact */}
              <div className="mt-4 flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Étape 1 sur 4 - Découverte du contexte
              </p>
            </AutoScrollContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};