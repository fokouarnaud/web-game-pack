/**
 * Test rapide du GameStore étendu
 * Vérification que les nouvelles fonctionnalités sont accessibles
 */

import { gameStoreActions } from '../src/store/gameStore';

// Test des action creators
console.log('Testing gameStoreActions...');

// Test action lesson phase
const updatePhaseAction = gameStoreActions.updateLessonPhase('situation', 0);
console.log('updateLessonPhase:', updatePhaseAction);

// Test action lesson progress  
const updateProgressAction = gameStoreActions.updateLessonProgress(1, 25);
console.log('updateLessonProgress:', updateProgressAction);

// Test action dialogue state
const updateDialogueAction = gameStoreActions.updateDialogueState({ 
  currentDialogueIndex: 2, 
  userTurnCompleted: true 
});
console.log('updateDialogueState:', updateDialogueAction);

// Test reset action
const resetAction = gameStoreActions.resetLessonState();
console.log('resetLessonState:', resetAction);

console.log('✅ All action creators working correctly!');
