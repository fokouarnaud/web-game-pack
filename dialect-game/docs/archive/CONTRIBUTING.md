# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer au Dialect Learning Game ! Ce guide vous explique comment participer au développement de manière efficace.

## 📋 Table des Matières
- [Code de Conduite](#code-de-conduite)
- [Types de Contributions](#types-de-contributions)
- [Setup Développement](#setup-développement)
- [Workflow Git](#workflow-git)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Pull Requests](#pull-requests)
- [Issues](#issues)

## 🤝 Code de Conduite

Ce projet adhère au [Contributor Covenant](https://www.contributor-covenant.org/). En participant, vous acceptez de respecter ce code.

### Nos Engagements
- **Respectueux** : Traiter tous les contributeurs avec respect
- **Inclusif** : Accueillir toutes les perspectives et expériences
- **Constructif** : Donner des commentaires constructifs
- **Professionnel** : Maintenir un environnement professionnel

## 🎯 Types de Contributions

### 🐛 Bug Reports
- Signaler des bugs avec des détails précis
- Fournir des steps pour reproduire
- Inclure captures d'écran si nécessaire

### ✨ Feature Requests
- Proposer de nouvelles fonctionnalités
- Expliquer le cas d'usage
- Discuter l'implémentation possible

### 📝 Documentation
- Améliorer la documentation existante
- Ajouter des exemples et guides
- Corriger les erreurs et typos

### 🔧 Code Contributions
- Corriger des bugs
- Implémenter de nouvelles fonctionnalités
- Améliorer les performances
- Refactoriser le code

### 🌍 Localisation
- Ajouter le support pour de nouvelles langues
- Améliorer les traductions existantes
- Corriger les erreurs linguistiques

## 🛠️ Setup Développement

### Prérequis
```bash
# Vérifier les versions
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
git --version   # >= 2.25.0
```

### 1. Fork et Clone
```bash
# Fork le repository sur GitHub
# Puis cloner votre fork
git clone https://github.com/VOTRE-USERNAME/dialect-learning-game.git
cd dialect-learning-game

# Ajouter le repository original comme remote
git remote add upstream https://github.com/ORIGINAL-OWNER/dialect-learning-game.git
```

### 2. Installation
```bash
# Installer les dépendances
npm install

# Copier la configuration d'environnement
cp .env.example .env.local

# Éditer les variables d'environnement si nécessaire
nano .env.local
```

### 3. Vérification Setup
```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, lancer les tests
npm run test

# Vérifier le linting
npm run lint

# Vérifier les types TypeScript
npm run type-check
```

### 4. Outils Recommandés

#### Extensions VSCode
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright"
  ]
}
```

#### Configuration VSCode
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## 🔄 Workflow Git

### 1. Workflow Standard
```bash
# Synchroniser avec upstream
git checkout main
git pull upstream main

# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Faire vos modifications
# ... code ...

# Committer vos changements
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Pousser votre branche
git push origin feature/nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
```

### 2. Convention de Nommage des Branches
```bash
# Fonctionnalités
feature/nom-de-la-fonctionnalite
feature/quiz-voice-input
feature/new-language-support

# Corrections de bugs
fix/nom-du-bug
fix/translation-cache-error
fix/mobile-layout-issue

# Documentation
docs/nom-de-la-doc
docs/api-guide
docs/deployment-instructions

# Refactoring
refactor/nom-du-refactor
refactor/api-service-structure
refactor/component-organization

# Chores (maintenance)
chore/nom-de-la-tache
chore/update-dependencies
chore/ci-improvement
```

### 3. Conventional Commits
Nous utilisons la [convention Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Format
<type>[optional scope]: <description>

# Exemples
feat: ajouter support audio pour pronunciations
fix: corriger erreur cache traduction
docs: mettre à jour guide APIs
style: améliorer responsive design mobile
refactor: restructurer services API
test: ajouter tests composant Quiz
chore: mettre à jour dépendances
```

#### Types de Commits
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Changements de style/UI
- `refactor`: Refactoring sans changement fonctionnel
- `test`: Ajout ou modification de tests
- `chore`: Maintenance, configuration, dépendances

## 📝 Standards de Code

### 1. TypeScript
```typescript
// ✅ Bon
interface QuizOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  languages: {
    source: string;
    target: string;
  };
  customWords?: string[];
}

function createQuiz(options: QuizOptions): Quiz {
  // Implementation...
}

// ❌ Éviter
function createQuiz(options: any): any {
  // Type any évité
}
```

### 2. React Components
```typescript
// ✅ Bon - Composant fonctionnel avec TypeScript
interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'default', 
  size = 'md', 
  disabled = false,
  onClick,
  children 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        disabled && 'btn-disabled'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ❌ Éviter - Props non typées
export function Button(props) {
  return <button {...props} />;
}
```

### 3. Hooks Personnalisés
```typescript
// ✅ Bon
export function useGameEngine(initialOptions: GameOptions) {
  const [state, setState] = useState<GameState>(() => ({
    score: 0,
    level: 1,
    isPlaying: false
  }));

  const startGame = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  return {
    ...state,
    startGame
  };
}
```

### 4. Services API
```typescript
// ✅ Bon - Service avec gestion d'erreurs
export class DictionaryService {
  private cache = new Map<string, DictionaryResult>();

  async searchWord(word: string): Promise<DictionaryResult> {
    try {
      // Vérifier le cache
      const cached = this.cache.get(word);
      if (cached) return cached;

      // Faire la requête
      const response = await fetch(`/api/dictionary/${word}`);
      if (!response.ok) {
        throw new Error(`Dictionary API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Mettre en cache
      this.cache.set(word, result);
      
      return result;
    } catch (error) {
      console.error('Dictionary search failed:', error);
      throw new DictionaryError(`Failed to search word: ${word}`);
    }
  }
}
```

### 5. Styling avec TailwindCSS
```typescript
// ✅ Bon - Classes conditionnelles avec cn()
import { cn } from '@/lib/utils';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  children: React.ReactNode;
}

export function Card({ variant = 'default', className, children }: CardProps) {
  return (
    <div
      className={cn(
        // Classes de base
        'rounded-lg p-4',
        // Classes conditionnelles
        {
          'bg-card shadow-sm': variant === 'default',
          'bg-card shadow-lg border': variant === 'elevated',
          'border-2 border-border': variant === 'outlined'
        },
        // Classes custom
        className
      )}
    >
      {children}
    </div>
  );
}

// ❌ Éviter - String concatenation
className={`card ${variant === 'elevated' ? 'shadow-lg' : ''} ${className}`}
```

## 🧪 Tests

### 1. Tests Unitaires
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  test('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Tests de Services
```typescript
// tests/services/DictionaryService.test.ts
import { DictionaryService } from '@/services/DictionaryService';

describe('DictionaryService', () => {
  let service: DictionaryService;

  beforeEach(() => {
    service = new DictionaryService();
  });

  test('should return word definition', async () => {
    const result = await service.searchWord('hello');
    
    expect(result.word).toBe('hello');
    expect(result.meanings).toHaveLength.greaterThan(0);
    expect(result.meanings[0].definitions).toHaveLength.greaterThan(0);
  });

  test('should cache results', async () => {
    const spy = vi.spyOn(global, 'fetch');
    
    // Premier appel
    await service.searchWord('test');
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Deuxième appel - devrait utiliser le cache
    await service.searchWord('test');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Tests E2E
```typescript
// tests/e2e/gameFlow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should complete a full quiz', async ({ page }) => {
    await page.goto('/');
    
    // Sélectionner les langues
    await page.click('[data-testid="language-selector-source"]');
    await page.click('[data-testid="language-en"]');
    
    await page.click('[data-testid="language-selector-target"]');
    await page.click('[data-testid="language-fr"]');
    
    // Démarrer le quiz
    await page.click('[data-testid="start-quiz-button"]');
    
    // Vérifier que le quiz est affiché
    await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible();
    
    // Répondre à une question
    await page.fill('[data-testid="answer-input"]', 'bonjour');
    await page.click('[data-testid="submit-answer"]');
    
    // Vérifier le feedback
    await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();
  });
});
```

### 4. Commandes de Test
```bash
# Tests unitaires
npm run test                    # Tous les tests
npm run test:watch             # Mode watch
npm run test:coverage          # Avec coverage
npm run test Button            # Tests spécifiques

# Tests E2E
npm run test:e2e               # Tous les tests E2E
npm run test:e2e:headed        # Mode headed
npm run test:e2e:debug         # Mode debug
npm run test:e2e -- --grep "Game Flow"  # Tests spécifiques
```

## 📚 Documentation

### 1. Comments Code
```typescript
/**
 * Service pour gérer les traductions via LibreTranslate API
 * 
 * @example
 * ```typescript
 * const service = new TranslationService();
 * const result = await service.translateText('Hello', 'fr');
 * console.log(result.translatedText); // "Bonjour"
 * ```
 */
export class TranslationService {
  /**
   * Traduit un texte vers une langue cible
   * 
   * @param text - Texte à traduire
   * @param targetLanguage - Code langue cible (ex: 'fr', 'es')
   * @param sourceLanguage - Code langue source (optionnel, détection auto)
   * @returns Promise avec le résultat de traduction
   * 
   * @throws {TranslationError} Quand la traduction échoue
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage = 'auto'
  ): Promise<TranslationResult> {
    // Implementation...
  }
}
```

### 2. README Sections
Chaque nouveau composant/service devrait avoir sa section dans le README :

```markdown
### QuizComponent

Composant interactif pour les quiz de traduction.

#### Props
- `sourceLanguage`: Langue source (ex: 'en')
- `targetLanguage`: Langue cible (ex: 'fr')  
- `difficulty`: Difficulté ('easy' | 'medium' | 'hard')
- `customWords`: Mots personnalisés (optionnel)

#### Exemple
```typescript
<QuizComponent
  sourceLanguage="en"
  targetLanguage="fr"
  difficulty="medium"
  onScoreUpdate={(score) => console.log(score)}
/>
```

### 3. Documentation Technique
Ajouter dans `docs/` pour les fonctionnalités complexes :

- `docs/ARCHITECTURE.md` - Architecture globale
- `docs/API-INTEGRATION.md` - Intégration APIs
- `docs/PERFORMANCE.md` - Optimisations

## 🔍 Pull Requests

### 1. Checklist PR
Avant de soumettre une PR :

- [ ] Code fonctionne localement
- [ ] Tests passent (`npm run test`)
- [ ] Linting passe (`npm run lint`)
- [ ] Type check passe (`npm run type-check`)
- [ ] Documentation mise à jour
- [ ] Changements testés sur mobile
- [ ] Screenshots ajoutés si changements UI
- [ ] CHANGELOG.md mis à jour si nécessaire

### 2. Template PR
```markdown
## Description
Brève description des changements.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests E2E ajoutés/mis à jour
- [ ] Tests manuels effectués

## Screenshots
(Si applicable)

## Checklist
- [ ] Code suit les standards du projet
- [ ] Auto-review effectuée
- [ ] Documentation mise à jour
- [ ] Tests passent
```

### 3. Review Process
1. **Auto-check** : Tests automatiques doivent passer
2. **Code Review** : Au moins 1 approbation requise
3. **Manual Testing** : Tests manuels sur les changements UI
4. **Merge** : Squash and merge vers main

## 🐛 Issues

### 1. Template Bug Report
```markdown
## Description
Brève description du bug.

## Steps to Reproduce
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Expected Behavior
Ce qui devrait se passer.

## Actual Behavior
Ce qui se passe réellement.

## Screenshots
(Si applicable)

## Environment
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Device: [ex: iPhone 12]

## Additional Context
Contexte supplémentaire.
```

### 2. Template Feature Request
```markdown
## Feature Description
Description claire de la fonctionnalité.

## Problem/Motivation
Quel problème cette fonctionnalité résout-elle ?

## Proposed Solution
Solution proposée en détail.

## Alternatives Considered
Autres solutions considérées.

## Additional Context
Mockups, exemples, etc.
```

### 3. Labels
- `bug` : Bugs confirmés
- `enhancement` : Nouvelles fonctionnalités
- `documentation` : Améliorations de docs
- `good first issue` : Bon pour débuter
- `help wanted` : Aide recherchée
- `priority:high` : Priorité haute
- `blocked` : Bloqué par autre chose

## 🏆 Reconnaissance

Les contributeurs sont reconnus dans :
- `CONTRIBUTORS.md` - Liste des contributeurs
- Releases notes - Mentions spéciales
- README.md - Section remerciements

### Types de Contributions Reconnues
- 💻 Code
- 📖 Documentation
- 🎨 Design
- 🐛 Bug reports
- 💡 Ideas
- 🌍 Translation
- ⚠️ Tests
- 🚧 Infrastructure

---

**🤝 Merci de contribuer au Dialect Learning Game !**

Votre participation aide à créer une meilleure expérience d'apprentissage pour tous.