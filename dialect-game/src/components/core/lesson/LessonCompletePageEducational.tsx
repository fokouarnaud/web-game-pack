/**
 * Page de completion de leçon éducationnelle
 * Affiche les résultats et permet de continuer vers la prochaine leçon
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Star,
  ArrowRight,
  RotateCcw,
  Home,
  Award,
  Target,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from '../../theme/ThemeToggleSimple';

export const LessonCompletePageEducational: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get('status') || 'success';
  const chapterNumber = parseInt(searchParams.get('chapterNumber') || '1');
  const score = parseInt(searchParams.get('score') || '0');
  const lessonId = searchParams.get('lessonId') || 'chapter-1-lesson-1';

  // Calculer les statistiques
  const maxScore = 450; // 3 mots × 3 exercices × 50 points max
  const percentage = Math.round((score / maxScore) * 100);
  const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

  // Messages d'encouragement selon le score
  const getMessage = () => {
    if (percentage >= 90) return "Excellent ! Vous maîtrisez parfaitement ces mots !";
    if (percentage >= 70) return "Très bien ! Vous progressez rapidement !";
    if (percentage >= 50) return "Bon travail ! Continuez à pratiquer !";
    return "Ne vous découragez pas ! La pratique mène à la perfection !";
  };

  const getNextLessonId = () => {
    // Logique simple pour la prochaine leçon
    if (lessonId === 'chapter-1-lesson-1') return 'chapter-1-lesson-2';
    if (lessonId === 'chapter-1-lesson-2') return 'chapter-1-lesson-3';
    return 'chapter-2-lesson-1';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lessons')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4 mr-2" />
              Leçons
            </Button>
            
            <h1 className="text-lg font-semibold">Leçon Terminée</h1>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Résultats principaux */}
          <Card className="text-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10"></div>
            <CardContent className="relative p-8">
              
              {/* Icône de succès */}
              <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Trophy className="h-12 w-12 text-green-600" />
              </div>

              {/* Titre */}
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Félicitations !
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {getMessage()}
              </p>

              {/* Score */}
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {score} / {maxScore}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {percentage}% de réussite
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="max-w-md mx-auto">
                  <Progress value={percentage} className="h-3" />
                </div>

                {/* Étoiles */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 ${
                        star <= stars 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Badges de réussite */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {percentage >= 50 && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Leçon complétée
                  </Badge>
                )}
                {percentage >= 70 && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Target className="h-3 w-3 mr-1" />
                    Bon niveau
                  </Badge>
                )}
                {percentage >= 90 && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    <Award className="h-3 w-3 mr-1" />
                    Excellent
                  </Badge>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Statistiques détaillées */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Votre progression
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-muted-foreground">Mots appris</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <div className="text-sm text-muted-foreground">Exercices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">1</div>
                  <div className="text-sm text-muted-foreground">Dialogue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stars}</div>
                  <div className="text-sm text-muted-foreground">Étoiles</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            
            {/* Continuer vers la prochaine leçon */}
            <Button
              onClick={() => navigate(`/game-lesson?lessonId=${getNextLessonId()}&chapterNumber=${chapterNumber}`)}
              size="lg"
              className="w-full"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Prochaine leçon
            </Button>

            {/* Actions secondaires */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/game-lesson?lessonId=${lessonId}&chapterNumber=${chapterNumber}`)}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refaire
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/lessons')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Menu leçons
              </Button>
            </div>
          </div>

          {/* Encouragement */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-3 text-pink-500" />
              <p className="text-sm text-muted-foreground">
                {percentage >= 70 
                  ? "Vous êtes sur la bonne voie ! Continuez à apprendre régulièrement."
                  : "N'hésitez pas à réviser cette leçon pour mieux mémoriser."
                }
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default LessonCompletePageEducational;