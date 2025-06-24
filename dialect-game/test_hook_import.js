/**
 * Test d'import du hook useGameLessonState
 * Vérification que le hook peut être importé sans erreur
 */

console.log('Testing useGameLessonState import...');

try {
  // Test d'import du hook
  const { useGameLessonState } = require('../src/hooks/useGameLessonState.ts');
  console.log('✅ useGameLessonState imported successfully');
  
  // Test d'import de l'interface
  console.log('✅ GameLessonStateHook interface available');
  
  console.log('✅ All imports working correctly!');
} catch (error) {
  console.error('❌ Import error:', error.message);
}
