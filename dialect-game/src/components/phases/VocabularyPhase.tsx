import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import type { LessonData } from 'data/lessonData';
import { useGameLessonState } from '../../hooks/useGameLessonState';
import { useAutoScroll } from '../../hooks/useAutoScroll';

interface VocabularyPhaseProps {
  lessonData: LessonData;
}

export const VocabularyPhase: React.FC<VocabularyPhaseProps> = ({ lessonData }) => {
  // État local pour la phase de vocabulaire
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Utilisation du store unifié
  const { updatePhase, updateProgress } = useGameLessonState();
  
  // **PHASE 2 UX : Auto-scroll intelligent vers boutons CTA**
  const { scrollToActionButton } = useAutoScroll();

  const currentWord = lessonData.vocabulary.words[currentWordIndex];
  const totalWords = lessonData.vocabulary.words.length;
  
  // **PHASE 2 UX : Auto-scroll vers boutons CTA après changement de mot**
  useEffect(() => {
    if (currentWordIndex > 0) { // Pas au premier mot pour éviter scroll initial
      const timer = setTimeout(() => {
        scrollToActionButton('[data-cta-button]');
      }, 500); // Délai 500ms après transition
      
      return () => clearTimeout(timer);
    }
  }, [currentWordIndex, scrollToActionButton]);
  
  // Audio avec feedback visuel moderne
  const playAudio = useCallback(async (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    setIsPlaying(true);
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // English pronunciation for learning
      utterance.rate = 0.8; // Slightly slower for learning
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Audio playback failed:', error);
      setIsPlaying(false);
    }
  }, []);

  // Navigation moderne avec validation et animations
  const handleNextWord = useCallback(async () => {
    setIsNavigating(true);
    
    // Petit délai pour l'animation de chargement
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (currentWordIndex < totalWords - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      
      // Mise à jour du progrès global
      const newProgress = Math.round(((nextIndex + 1) / totalWords) * 100);
      updateProgress(newProgress);
    } else {
      // Transition vers la phase suivante
      updatePhase('exercises');
      updateProgress(0);
    }
    
    setIsNavigating(false);
  }, [currentWordIndex, totalWords, updatePhase, updateProgress]);

  // Répéter le mot actuel
  const handleRepeatWord = useCallback(() => {
    playAudio(currentWord.english);
  }, [currentWord.english, playAudio]);

  return (
    <div className="min-h-screen flex flex-col space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header moderne sans duplication progression */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Vocabulaire
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mot {currentWordIndex + 1} sur {totalWords}
            </p>
          </div>
        </div>
      </div>

      {/* Card principale responsive avec animations */}
      <Card className="flex-1 max-w-2xl mx-auto w-full shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transform transition-all duration-500 hover:shadow-2xl">
        <CardContent className="p-6 md:p-8 lg:p-10">
          <div className="space-y-8 transform transition-all duration-300">
            
            {/* Badge de contexte avec animation */}
            <div className="flex justify-center transform transition-all duration-300 hover:scale-105">
              <Badge variant="outline" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                💭 {currentWord.context || 'Apprentissage du vocabulaire'}
              </Badge>
            </div>

            {/* Mot français avec design moderne et animations */}
            <div className="text-center space-y-4 py-6 transform transition-all duration-500">
              <div className="relative">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-700 dark:text-gray-300 mb-2 transform transition-all duration-300 hover:scale-105">
                  {currentWord.french || currentWord.translation}
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full transition-all duration-300 hover:w-20"></div>
              </div>
            </div>

            {/* Mot anglais avec pronunciation et animations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 md:p-8 text-center space-y-4 transform transition-all duration-500 hover:scale-[1.02]">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transform transition-all duration-300">
                {currentWord.english || currentWord.word}
              </h1>
              
              <div className="space-y-2">
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-mono transition-all duration-200">
                  🗣️ /{currentWord.pronunciation}/
                </p>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 transition-all duration-200">
                  💡 {currentWord.tip || 'Répétez plusieurs fois pour mémoriser'}
                </p>
              </div>
            </div>

            {/* Boutons d'action modernes responsive avec animations */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={() => playAudio(currentWord.english || currentWord.word)}
                disabled={isPlaying}
                variant="outline"
                size="lg"
                className="flex-1 h-14 text-lg font-medium border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                <Volume2 className={`h-5 w-5 mr-3 transition-all duration-200 ${isPlaying ? 'animate-pulse text-blue-600' : ''}`} />
                {isPlaying ? 'Lecture...' : 'Écouter'}
              </Button>
              
              <Button
                onClick={handleNextWord}
                disabled={isNavigating}
                size="lg"
                data-cta-button
                className="flex-1 h-14 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-75"
              >
                {isNavigating ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                    Chargement...
                  </>
                ) : (
                  <>
                    {currentWordIndex < totalWords - 1 ? 'Mot suivant' : 'Terminer le vocabulaire'}
                    <ArrowRight className="h-5 w-5 ml-3 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
};