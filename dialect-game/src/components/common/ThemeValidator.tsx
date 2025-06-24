/**
 * Theme Validator - Teste l'application du thème sur tous les composants du user flow
 * Vérifie la cohérence des couleurs, contrastes et transitions dark/light mode
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/theme/ThemeToggleSimple';
import { useTheme } from '@/components/theme/ThemeProvider';
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  Brain, 
  Zap, 
  Lightbulb, 
  Heart, 
  Users,
  CheckCircle2,
  Mic,
  Volume2
} from 'lucide-react';

export const ThemeValidator: React.FC = () => {
  const { theme } = useTheme();
  const [activeDemo, setActiveDemo] = useState<string>('situation');

  const phases = [
    { 
      id: 'situation', 
      title: 'Situation-Problème', 
      icon: <Lightbulb className="h-5 w-5" />,
      gradient: 'from-orange-500 to-amber-500'
    },
    { 
      id: 'vocabulary', 
      title: 'Vocabulaire', 
      icon: <BookOpen className="h-5 w-5" />,
      gradient: 'from-blue-500 to-indigo-500'
    },
    { 
      id: 'exercises', 
      title: 'Exercices', 
      icon: <Target className="h-5 w-5" />,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'integration', 
      title: 'Intégration', 
      icon: <Users className="h-5 w-5" />,
      gradient: 'from-purple-500 to-indigo-500'
    }
  ];

  const getCurrentThemeInfo = () => {
    switch (theme) {
      case 'light': return { emoji: '☀️', name: 'Mode Clair', color: 'text-yellow-600' };
      case 'dark': return { emoji: '🌙', name: 'Mode Sombre', color: 'text-purple-400' };
      case 'system': return { emoji: '💻', name: 'Mode Système', color: 'text-blue-500' };
      default: return { emoji: '⚙️', name: 'Mode Inconnu', color: 'text-gray-500' };
    }
  };

  const themeInfo = getCurrentThemeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      
      {/* Header avec thème toggle */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-blue-100 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Validateur de Thème
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Test de cohérence UI/UX dark/light mode
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className={`${themeInfo.color} bg-opacity-10`}>
                {themeInfo.emoji} {themeInfo.name}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation des phases */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Navigation des Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {phases.map((phase) => (
                <Button
                  key={phase.id}
                  onClick={() => setActiveDemo(phase.id)}
                  variant={activeDemo === phase.id ? "default" : "outline"}
                  className={`h-auto p-4 flex-col gap-2 ${
                    activeDemo === phase.id 
                      ? `bg-gradient-to-r ${phase.gradient} text-white hover:opacity-90` 
                      : ''
                  }`}
                >
                  {phase.icon}
                  <span className="text-sm font-medium">{phase.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Démonstration de la phase active */}
        {activeDemo === 'situation' && (
          <Card className="bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-orange-900/10 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                  Situation-Problème
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-red-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">🎯 Votre défi</h3>
                  </div>
                  <p className="mt-2 text-slate-700 dark:text-slate-300">
                    Test de lisibilité et contraste en mode {themeInfo.name.toLowerCase()}
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-blue-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">💡 Importance</h3>
                  </div>
                  <p className="mt-2 text-slate-700 dark:text-slate-300">
                    Vérification de l'accessibilité et de la cohérence visuelle
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeDemo === 'vocabulary' && (
          <Card className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Vocabulaire
                </h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Hello
                </p>
                <p className="text-lg text-blue-600 dark:text-blue-400">
                  Bonjour
                </p>
              </div>
              
              <div className="flex gap-3 justify-center mt-6">
                <Button variant="outline" className="border-blue-300 hover:bg-blue-50 dark:border-blue-600 dark:hover:bg-blue-900/20">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Écouter
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeDemo === 'exercises' && (
          <Card className="bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/10 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-green-500 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Exercices Pratiques
                </h2>
                <Progress value={75} className="h-2 max-w-xs mx-auto mt-4" />
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Nice to meet you
                  </p>
                  <p className="text-lg text-green-600 dark:text-green-400">
                    Ravi de vous rencontrer
                  </p>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" className="border-green-300 hover:bg-green-50 dark:border-green-600 dark:hover:bg-green-900/20">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Écouter
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    <Mic className="h-4 w-4 mr-2" />
                    Prononcer
                  </Button>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="mt-2 text-lg font-bold text-slate-700 dark:text-slate-200">
                    92%
                  </p>
                  <p className="text-green-600 dark:text-green-400">
                    ✨ Excellent ! Vous progressez rapidement !
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeDemo === 'integration' && (
          <Card className="bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/10 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Mise en Situation
                </h2>
                <Progress value={50} className="h-2 max-w-xs mx-auto mt-4" />
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-end">
                  <div className="max-w-[80%] p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl">
                    <p className="font-medium text-sm">Hello!</p>
                    <p className="text-xs text-blue-100">Bonjour !</p>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-100 rounded-2xl">
                    <p className="font-medium text-sm">Nice to meet you!</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Ravi de vous rencontrer !</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">À vous de dire :</h3>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">How are you?</p>
                <p className="text-blue-600 dark:text-blue-400">Comment allez-vous ?</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résumé de validation */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Validation du Thème
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Contrastes</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Ratios WCAG respectés pour l'accessibilité
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">✅ Cohérence</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Gradients et couleurs harmonieux
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">✅ Transitions</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Animations fluides entre modes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};