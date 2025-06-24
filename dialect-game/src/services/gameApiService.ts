/**
 * Game API Service - Service composite combinant Dictionary et Translation APIs
 * Task 3: Intégration APIs gratuites - Service principal pour le jeu
 */

import { dictionaryApi, type DictionaryEntry } from './api/dictionaryApi';
import { translateApi, type TranslationResult, type LanguageInfo } from './api/translateApi';

export interface WordData {
  word: string;
  language: string;
  definition?: string;
  phonetic?: string;
  audio?: string;
  synonyms: string[];
  translations: Record<string, string>; // language -> translation
  difficulty: 'easy' | 'medium' | 'hard';
  partOfSpeech?: string;
}

export interface GameWord {
  id: string;
  originalWord: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctTranslation: string;
  alternativeTranslations: string[];
  distractors: string[]; // Wrong answers
  difficulty: 'easy' | 'medium' | 'hard';
  hints: {
    phonetic?: string;
    audio?: string;
    definition?: string;
    synonyms: string[];
  };
  metadata: {
    partOfSpeech?: string;
    confidence?: number;
    source: 'dictionary' | 'translation' | 'combined';
  };
}

export interface QuizQuestion {
  id: string;
  type: 'translation' | 'definition' | 'pronunciation' | 'synonym';
  question: string;
  correctAnswer: string;
  options: string[];
  word: GameWord;
  timeLimit: number; // seconds
  points: number;
}

export class GameApiService {
  private wordCache = new Map<string, WordData>();
  private gameWordsCache = new Map<string, GameWord[]>();

  /**
   * Récupère les données complètes d'un mot (définition + traductions)
   */
  async getWordData(word: string, sourceLanguage = 'en'): Promise<WordData> {
    const cacheKey = `${sourceLanguage}:${word}`;
    
    if (this.wordCache.has(cacheKey)) {
      return this.wordCache.get(cacheKey)!;
    }

    try {
      // Récupérer les données du dictionnaire
      const [dictionaryData] = await Promise.allSettled([
        dictionaryApi.searchWord(word, sourceLanguage)
      ]);

      let definition = '';
      let phonetic = '';
      let audio = '';
      let synonyms: string[] = [];
      let partOfSpeech = '';

      if (dictionaryData.status === 'fulfilled') {
        const entries = dictionaryData.value;
        if (entries.length > 0) {
          const entry = entries[0];
          definition = entry.meanings[0]?.definitions[0]?.definition || '';
          phonetic = entry.phonetic || entry.phonetics[0]?.text || '';
          audio = entry.phonetics.find(p => p.audio)?.audio || '';
          partOfSpeech = entry.meanings[0]?.partOfSpeech || '';
          
          // Collecter les synonymes
          for (const meaning of entry.meanings) {
            if (meaning.synonyms) synonyms.push(...meaning.synonyms);
            for (const def of meaning.definitions) {
              if (def.synonyms) synonyms.push(...def.synonyms);
            }
          }
        }
      }

      // Générer des traductions pour les langues communes
      const commonLanguages = ['es', 'fr', 'de', 'it', 'pt'];
      const translations: Record<string, string> = {};
      
      const translationPromises = commonLanguages
        .filter(lang => lang !== sourceLanguage)
        .map(async (targetLang) => {
          try {
            const result = await translateApi.translateText(word, targetLang, sourceLanguage);
            return { lang: targetLang, translation: result.translatedText };
          } catch (error) {
            console.warn(`Failed to translate "${word}" to ${targetLang}:`, error);
            return { lang: targetLang, translation: word }; // Fallback
          }
        });

      const translationResults = await Promise.all(translationPromises);
      translationResults.forEach(({ lang, translation }) => {
        translations[lang] = translation;
      });

      // Déterminer la difficulté basée sur la longueur et la complexité
      const difficulty = this.calculateWordDifficulty(word, synonyms.length, definition.length);

      const wordData: WordData = {
        word,
        language: sourceLanguage,
        definition,
        phonetic,
        audio,
        synonyms: [...new Set(synonyms)], // Supprimer les doublons
        translations,
        difficulty,
        partOfSpeech
      };

      this.wordCache.set(cacheKey, wordData);
      return wordData;
    } catch (error) {
      console.error(`Failed to get word data for "${word}":`, error);
      
      // Retourner des données minimales en cas d'erreur
      return {
        word,
        language: sourceLanguage,
        synonyms: [],
        translations: {},
        difficulty: 'medium'
      };
    }
  }

  /**
   * Génère des mots de jeu pour un niveau donné
   */
  async generateGameWords(
    words: string[],
    sourceLanguage: string,
    targetLanguage: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GameWord[]> {
    const cacheKey = `${sourceLanguage}-${targetLanguage}-${difficulty}-${words.join(',')}`;
    
    if (this.gameWordsCache.has(cacheKey)) {
      return this.gameWordsCache.get(cacheKey)!;
    }

    const gameWords: GameWord[] = [];

    for (const word of words) {
      try {
        const wordData = await this.getWordData(word, sourceLanguage);
        
        // Traduire le mot principal
        const mainTranslation = await translateApi.translateText(word, targetLanguage, sourceLanguage);
        
        // Générer des traductions alternatives si des synonymes existent
        const alternativeTranslations: string[] = [];
        if (wordData.synonyms.length > 0) {
          const synonymTranslations = await translateApi.translateBatch(
            wordData.synonyms.slice(0, 3),
            targetLanguage,
            sourceLanguage
          );
          alternativeTranslations.push(...synonymTranslations.map(t => t.translatedText));
        }

        // Générer des distracteurs (réponses incorrectes)
        const distractors = await this.generateDistractors(
          mainTranslation.translatedText,
          targetLanguage,
          3
        );

        const gameWord: GameWord = {
          id: `${word}-${sourceLanguage}-${targetLanguage}`,
          originalWord: word,
          sourceLanguage,
          targetLanguage,
          correctTranslation: mainTranslation.translatedText,
          alternativeTranslations,
          distractors,
          difficulty: wordData.difficulty,
          hints: {
            phonetic: wordData.phonetic,
            audio: wordData.audio,
            definition: wordData.definition,
            synonyms: wordData.synonyms
          },
          metadata: {
            partOfSpeech: wordData.partOfSpeech,
            confidence: mainTranslation.confidence,
            source: 'combined'
          }
        };

        gameWords.push(gameWord);
      } catch (error) {
        console.error(`Failed to generate game word for "${word}":`, error);
      }
    }

    this.gameWordsCache.set(cacheKey, gameWords);
    return gameWords;
  }

  /**
   * Génère des questions de quiz basées sur les mots du jeu
   */
  async generateQuizQuestions(gameWords: GameWord[], questionCount = 10): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];
    const questionTypes: QuizQuestion['type'][] = ['translation', 'definition', 'synonym'];

    for (let i = 0; i < Math.min(questionCount, gameWords.length); i++) {
      const word = gameWords[i];
      const questionType = questionTypes[i % questionTypes.length];

      let question = '';
      let correctAnswer = '';
      let options: string[] = [];
      let timeLimit = 30;
      let points = 10;

      switch (questionType) {
        case 'translation':
          question = `Translate "${word.originalWord}" from ${word.sourceLanguage} to ${word.targetLanguage}`;
          correctAnswer = word.correctTranslation;
          options = [correctAnswer, ...word.distractors].slice(0, 4);
          break;

        case 'definition':
          if (word.hints.definition) {
            question = `What does "${word.originalWord}" mean?`;
            correctAnswer = word.hints.definition;
            options = [correctAnswer, ...await this.generateDefinitionDistractors(3)];
          } else {
            // Fallback to translation question
            question = `Translate "${word.originalWord}"`;
            correctAnswer = word.correctTranslation;
            options = [correctAnswer, ...word.distractors].slice(0, 4);
          }
          break;

        case 'synonym':
          if (word.hints.synonyms.length > 0) {
            question = `Which word is a synonym of "${word.originalWord}"?`;
            correctAnswer = word.hints.synonyms[0];
            options = [correctAnswer, ...word.distractors].slice(0, 4);
          } else {
            // Fallback to translation question
            question = `Translate "${word.originalWord}"`;
            correctAnswer = word.correctTranslation;
            options = [correctAnswer, ...word.distractors].slice(0, 4);
          }
          break;
      }

      // Ajuster les points et le temps limite selon la difficulté
      switch (word.difficulty) {
        case 'easy':
          points = 5;
          timeLimit = 20;
          break;
        case 'hard':
          points = 20;
          timeLimit = 45;
          break;
      }

      // Mélanger les options
      options = this.shuffleArray(options);

      questions.push({
        id: `q-${word.id}-${i}`,
        type: questionType,
        question,
        correctAnswer,
        options,
        word,
        timeLimit,
        points
      });
    }

    return questions;
  }

  /**
   * Calcule la difficulté d'un mot
   */
  private calculateWordDifficulty(
    word: string,
    synonymsCount: number,
    definitionLength: number
  ): 'easy' | 'medium' | 'hard' {
    let score = 0;

    // Longueur du mot
    if (word.length <= 4) score += 1;
    else if (word.length <= 7) score += 2;
    else score += 3;

    // Nombre de synonymes (moins de synonymes = plus difficile)
    if (synonymsCount === 0) score += 2;
    else if (synonymsCount <= 2) score += 1;

    // Longueur de la définition (plus courte = plus difficile)
    if (definitionLength <= 50) score += 2;
    else if (definitionLength <= 100) score += 1;

    if (score <= 2) return 'easy';
    if (score <= 4) return 'medium';
    return 'hard';
  }

  /**
   * Génère des distracteurs pour les questions à choix multiples
   */
  private async generateDistractors(
    correctAnswer: string,
    language: string,
    count: number
  ): Promise<string[]> {
    // Pour l'instant, générer des distracteurs simples
    // Dans une vraie implémentation, on pourrait utiliser des mots similaires
    const commonDistractors = {
      'en': ['apple', 'book', 'water', 'house', 'friend', 'happy', 'blue', 'fast'],
      'es': ['manzana', 'libro', 'agua', 'casa', 'amigo', 'feliz', 'azul', 'rápido'],
      'fr': ['pomme', 'livre', 'eau', 'maison', 'ami', 'heureux', 'bleu', 'rapide'],
      'de': ['apfel', 'buch', 'wasser', 'haus', 'freund', 'glücklich', 'blau', 'schnell']
    };

    const distractors = commonDistractors[language as keyof typeof commonDistractors] || commonDistractors['en'];
    return distractors
      .filter(word => word !== correctAnswer.toLowerCase())
      .slice(0, count);
  }

  /**
   * Génère des distracteurs pour les définitions
   */
  private async generateDefinitionDistractors(count: number): Promise<string[]> {
    return [
      'A type of musical instrument',
      'A cooking utensil used in the kitchen',
      'An outdoor recreational activity',
      'A mathematical concept',
      'A historical period or era'
    ].slice(0, count);
  }

  /**
   * Mélange un tableau
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Récupère les langues supportées
   */
  async getSupportedLanguages(): Promise<LanguageInfo[]> {
    return await translateApi.getSupportedLanguages();
  }

  /**
   * Teste la connectivité aux APIs
   */
  async testApiConnectivity(): Promise<{
    dictionary: boolean;
    translation: boolean;
    overall: boolean;
  }> {
    const [dictionaryTest, translationTest] = await Promise.allSettled([
      dictionaryApi.wordExists('hello'),
      translateApi.testConnection()
    ]);

    const dictionary = dictionaryTest.status === 'fulfilled' && dictionaryTest.value;
    const translation = translationTest.status === 'fulfilled' && translationTest.value;

    return {
      dictionary,
      translation,
      overall: dictionary && translation
    };
  }

  /**
   * Nettoie tous les caches
   */
  clearAllCaches(): void {
    this.wordCache.clear();
    this.gameWordsCache.clear();
    dictionaryApi.clearCache();
    translateApi.clearCache();
  }

  /**
   * Récupère les statistiques des caches
   */
  getCacheStats() {
    return {
      wordCache: this.wordCache.size,
      gameWordsCache: this.gameWordsCache.size,
      dictionaryCache: dictionaryApi.getCacheStats().size,
      translationCache: translateApi.getCacheStats().size
    };
  }
}

// Instance singleton
export const gameApiService = new GameApiService();