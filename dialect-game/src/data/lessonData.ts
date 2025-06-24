interface LessonWord {
  word: string;
  translation: string;
  pronunciation: string;
}

interface LessonExercise {
  instruction: string;
  word: string;
  translation: string;
}

interface DialogueLine {
  speaker: 'npc' | 'user';
  text: string;
  translation: string;
}

interface LessonData {
  title: string;
  situation: {
    context: string;
    problem: string;
    motivation: string;
  };
  vocabulary: {
    words: LessonWord[];
  };
  exercises: {
    exercises: LessonExercise[];
  };
  integration: {
    scenario: string;
    dialogue: DialogueLine[];
  };
}

export const getLessonData = (): LessonData => ({
  title: "Premiers Contacts en Anglais",
  situation: {
    context: "Vous arrivez dans un café anglophone pour la première fois",
    problem: "Comment saluer et vous présenter naturellement ?",
    motivation: "Créer une première impression positive"
  },
  vocabulary: {
    words: [
      { word: "Hello", translation: "Bonjour", pronunciation: "həˈləʊ" },
      { word: "Nice to meet you", translation: "Ravi de vous rencontrer", pronunciation: "naɪs tuː miːt juː" }
    ]
  },
  exercises: {
    exercises: [
      { instruction: "Saluez poliment", word: "Hello", translation: "Bonjour" },
      { instruction: "Présentez-vous", word: "Nice to meet you", translation: "Ravi de vous rencontrer" }
    ]
  },
  integration: {
    scenario: "Un inconnu vous aborde dans le café.",
    dialogue: [
      { speaker: "npc", text: "Hello! How are you?", translation: "Bonjour ! Comment allez-vous ?" },
      { speaker: "user", text: "Hello! I'm fine, thank you.", translation: "Bonjour ! Je vais bien, merci." },
      { speaker: "npc", text: "Nice to meet you!", translation: "Ravi de vous rencontrer !" },
      { speaker: "user", text: "Nice to meet you too!", translation: "Ravi de vous rencontrer aussi !" }
    ]
  }
});

export type { LessonData, LessonWord, LessonExercise, DialogueLine };