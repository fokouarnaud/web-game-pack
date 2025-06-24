# useGameLessonState Hook Documentation

## Overview

Le hook `useGameLessonState` fournit une API centralisée pour gérer les états de leçon dans les composants game-lesson, éliminant le besoin d'`useState` locaux complexes qui peuvent causer des cycles infinis de re-render.

## Installation

```typescript
import { useGameLessonState } from '../hooks/useGameLessonState';
```

## Usage de Base

```typescript
const MyGameLessonComponent = () => {
  const {
    // Getters - État actuel
    currentPhase,
    currentStep,
    phaseProgress,
    dialogueState,
    
    // Setters - Actions pour modifier l'état
    updatePhase,
    updateStep,
    updateProgress,
    updateDialogue,
    
    // Actions - Opérations complexes
    resetLesson,
    completePhase,
    moveToNextStep,
    startPhase,
    
    // Utilitaires
    isPhaseCompleted,
    getTotalStepsForCurrentPhase,
  } = useGameLessonState();

  // Démarrer une leçon
  const handleStartLesson = () => {
    startPhase('situation');
  };

  // Passer à l'étape suivante
  const handleNextStep = () => {
    moveToNextStep();
  };

  // Terminer une phase et passer à la suivante
  const handleCompletePhase = () => {
    completePhase();
  };

  return (
    <div>
      <h2>Phase actuelle: {currentPhase}</h2>
      <p>Étape: {currentStep} / {getTotalStepsForCurrentPhase()}</p>
      <p>Progrès: {phaseProgress}%</p>
      
      <button onClick={handleStartLesson}>Démarrer</button>
      <button onClick={handleNextStep}>Étape suivante</button>
      <button onClick={handleCompletePhase}>Terminer phase</button>
    </div>
  );
};
```

## API Reference

### Getters

- `currentPhase`: Phase actuelle ('situation' | 'vocabulary' | 'exercises' | 'integration' | null)
- `currentStep`: Étape actuelle dans la phase (number)
- `phaseProgress`: Progrès en pourcentage (0-100)
- `dialogueState`: État du dialogue { currentDialogueIndex, userTurnCompleted }

### Setters

- `updatePhase(phase, step?)`: Changer de phase avec étape optionnelle
- `updateStep(step)`: Mettre à jour l'étape courante
- `updateProgress(progress)`: Mettre à jour le progrès (0-100)
- `updateDialogue(dialogueState)`: Mettre à jour l'état du dialogue

### Actions

- `resetLesson()`: Réinitialiser complètement la leçon
- `completePhase()`: Terminer la phase actuelle et passer à la suivante
- `moveToNextStep()`: Passer à l'étape suivante dans la phase
- `startPhase(phase)`: Démarrer une phase spécifique

### Utilitaires

- `isPhaseCompleted(phase)`: Vérifier si une phase est terminée
- `getTotalStepsForCurrentPhase()`: Obtenir le nombre total d'étapes pour la phase actuelle

## Remplacement de useState

### Avant (problématique)

```typescript
// ❌ Pattern problématique avec cycles infinis
const [state, setState] = useState({
  currentPhase: 'situation',
  currentStep: 0,
  phaseProgress: 0
});

useEffect(() => {
  if (state.currentPhase === 'integration' && !userTurnCompleted) {
    setState(prev => ({ ...prev, phaseProgress: 100 })); // ⚠️ Cycle infini
  }
}, [state.currentPhase, userTurnCompleted]);
```

### Après (solution)

```typescript
// ✅ Solution avec hook centralisé
const { currentPhase, updateProgress } = useGameLessonState();

useEffect(() => {
  if (currentPhase === 'integration' && !userTurnCompleted) {
    updateProgress(100); // ✅ Pas de cycle infini
  }
}, [currentPhase, userTurnCompleted, updateProgress]);
```

## Validation et Logs

Le hook inclut une validation automatique et des logs de debugging :

- Validation des phases valides
- Validation des étapes (>= 0)
- Validation du progrès (0-100)
- Logs détaillés pour debugging

## Migration des Composants Existants

1. Remplacer `useState` par `useGameLessonState()`
2. Utiliser les getters au lieu de `state.property`
3. Utiliser les setters au lieu de `setState`
4. Simplifier ou supprimer les `useEffect` problématiques

## Exemple Complet : GameLessonEducational

```typescript
export const GameLessonEducational: React.FC = () => {
  const { navigateToLessonComplete } = useGameLessonNavigation();
  const {
    currentPhase,
    currentStep,
    phaseProgress,
    dialogueState,
    updatePhase,
    completePhase,
    updateDialogue,
    resetLesson
  } = useGameLessonState();

  // Plus de useState complexe !
  // Plus d'useEffect avec dépendances circulaires !
  
  const handleAnswerSubmit = () => {
    if (currentPhase === 'integration') {
      updateDialogue({ userTurnCompleted: true });
    }
    // Logic simplified without setState cycles
  };

  return (
    <div>
      {/* Interface utilisateur */}
    </div>
  );
};
```
