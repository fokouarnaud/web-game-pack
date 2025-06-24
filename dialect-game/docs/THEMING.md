# 🎨 Guide de Personnalisation des Thèmes

Guide complet pour personnaliser l'apparence du Dialect Learning Game avec TailwindCSS et shadcn/ui.

## 📋 Table des Matières
- [Vue d'ensemble](#vue-densemble)
- [Structure des Thèmes](#structure-des-thèmes)
- [Thèmes Intégrés](#thèmes-intégrés)
- [Créer un Thème Personnalisé](#créer-un-thème-personnalisé)
- [Variables CSS](#variables-css)
- [shadcn/ui Customization](#shadcnui-customization)
- [Dark/Light Mode](#darklight-mode)
- [Exemples Pratiques](#exemples-pratiques)

## 🎯 Vue d'ensemble

Le système de thèmes du Dialect Game combine :
- **TailwindCSS** pour les utilitaires CSS
- **shadcn/ui** pour les composants modernes
- **CSS Variables** pour la personnalisation dynamique
- **React Context** pour la gestion d'état

### Architecture
```
src/styles/
├── globals.css          # Variables CSS + styles de base
├── theme.ts            # Configuration TypeScript des thèmes
└── components/
    └── ThemeProvider.tsx # Context React pour thèmes
```

## 🏗️ Structure des Thèmes

### Configuration TypeScript
```typescript
// src/styles/theme.ts
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    // Variables shadcn/ui
    card: string;
    popover: string;
    muted: string;
    accent: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
  };
  animations?: {
    enabled: boolean;
    duration: 'fast' | 'normal' | 'slow';
  };
}

export const themes: Record<string, ThemeConfig> = {
  // Thèmes définis ici
};
```

### Variables CSS
```css
/* src/styles/globals.css */
:root {
  /* Variables shadcn/ui */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* Variables personnalisées */
  --font-display: 'Poppins', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  
  /* Animations */
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 300ms;
  --animation-duration-slow: 500ms;
}

.dark {
  /* Variables mode sombre */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

## 🎨 Thèmes Intégrés

### 1. Classic Theme
Thème par défaut moderne et professionnel.

```typescript
classic: {
  name: 'Classic',
  colors: {
    primary: '#3B82F6',      // Bleu moderne
    secondary: '#8B5CF6',    // Violet
    background: '#FFFFFF',   // Blanc
    foreground: '#1F2937',   // Gris foncé
    card: '#FFFFFF',
    accent: '#F3F4F6',
    // ...
  },
  fonts: {
    display: 'Poppins',
    body: 'Inter',
    mono: 'JetBrains Mono'
  }
}
```

### 2. Modern Theme
Thème contemporain avec couleurs vives.

```typescript
modern: {
  name: 'Modern',
  colors: {
    primary: '#10B981',      // Vert emeraude
    secondary: '#F59E0B',    // Orange
    background: '#F9FAFB',   // Gris très clair
    foreground: '#111827',   // Noir
    // ...
  }
}
```

### 3. Nature Theme
Inspiré par la nature, couleurs apaisantes.

```typescript
nature: {
  name: 'Nature',
  colors: {
    primary: '#059669',      // Vert forêt
    secondary: '#D97706',    // Brun automne
    background: '#F0FDF4',   // Vert très clair
    foreground: '#064E3B',   // Vert foncé
    // ...
  }
}
```

### 4. Neon Theme
Thème cyberpunk avec couleurs néon.

```typescript
neon: {
  name: 'Neon',
  colors: {
    primary: '#EC4899',      // Rose néon
    secondary: '#06B6D4',    // Cyan
    background: '#0F172A',   // Bleu très foncé
    foreground: '#F1F5F9',   // Blanc cassé
    // ...
  }
}
```

## ✨ Créer un Thème Personnalisé

### Étape 1 : Définir le Thème
```typescript
// src/styles/theme.ts
export const themes = {
  // Thèmes existants...
  
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#F97316',      // Orange sunset
      secondary: '#EF4444',    // Rouge corail
      background: '#FFF7ED',   // Orange très clair
      foreground: '#9A3412',   // Orange foncé
      card: '#FFFFFF',
      popover: '#FFFFFF',
      muted: '#FED7AA',        // Orange clair
      accent: '#FDBA74',       // Orange moyen
      destructive: '#DC2626',  // Rouge
      border: '#FB923C',       // Orange border
      input: '#FED7AA',        // Orange input
      ring: '#F97316',         // Orange ring
    },
    fonts: {
      display: 'Playfair Display',
      body: 'Source Sans Pro',
      mono: 'Source Code Pro'
    },
    animations: {
      enabled: true,
      duration: 'normal'
    }
  }
};
```

### Étape 2 : Ajouter les Variables CSS
```css
/* src/styles/globals.css */
[data-theme="sunset"] {
  --background: 37 99% 97%;
  --foreground: 20 83% 20%;
  --primary: 24 95% 53%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 84% 60%;
  --secondary-foreground: 0 0% 100%;
  --muted: 24 100% 83%;
  --muted-foreground: 20 83% 35%;
  --accent: 24 100% 70%;
  --accent-foreground: 20 83% 20%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  --border: 24 95% 63%;
  --input: 24 100% 83%;
  --ring: 24 95% 53%;
  
  /* Variables personnalisées */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Source Sans Pro', sans-serif;
  --font-mono: 'Source Code Pro', monospace;
}
```

### Étape 3 : Mise à Jour du Context
```typescript
// src/components/ThemeProvider.tsx
import { themes } from '../styles/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState('classic');
  
  const applyTheme = (themeName: string) => {
    const theme = themes[themeName];
    if (theme) {
      document.documentElement.setAttribute('data-theme', themeName);
      setCurrentTheme(themeName);
      
      // Appliquer les fonts
      document.documentElement.style.setProperty(
        '--font-display', 
        theme.fonts.display
      );
      // ...
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## 🎨 Variables CSS Avancées

### Couleurs Sémantiques
```css
:root {
  /* États de réussite */
  --success: 142 76% 36%;
  --success-foreground: 355 7% 97%;
  
  /* États d'attention */
  --warning: 38 92% 50%;
  --warning-foreground: 48 96% 89%;
  
  /* États d'information */
  --info: 199 89% 48%;
  --info-foreground: 0 0% 100%;
  
  /* Couleurs de jeu spécifiques */
  --game-correct: 142 76% 36%;
  --game-incorrect: 0 84% 60%;
  --game-partial: 38 92% 50%;
  --game-timer: 24 95% 53%;
}
```

### Espacements et Bordures
```css
:root {
  /* Rayons de bordure */
  --radius-sm: 0.375rem;
  --radius: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  
  /* Ombres */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🌙 Dark/Light Mode

### Configuration Automatique
```typescript
// src/hooks/useTheme.ts
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // Détecter la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  useEffect(() => {
    // Écouter les changements système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isDark, toggleDarkMode };
}
```

### Variables Dark Mode
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 94.1%;
}
```

## 🎛️ shadcn/ui Customization

### Configuration de Base
```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### Personnaliser les Composants
```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Variant personnalisé
        game: "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Taille personnalisée
        xl: "h-12 rounded-lg px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

## 📱 Responsive Theming

### Breakpoints Personnalisés
```typescript
// tailwind.config.js
export default {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px',
      // Breakpoints personnalisés
      'mobile': {'max': '767px'},
      'tablet': {'min': '768px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
    }
  }
}
```

### Variables Responsive
```css
/* Variables mobiles */
@media (max-width: 767px) {
  :root {
    --font-size-base: 14px;
    --spacing-unit: 4px;
    --component-height: 44px; /* Taille tactile */
  }
}

/* Variables desktop */
@media (min-width: 1024px) {
  :root {
    --font-size-base: 16px;
    --spacing-unit: 8px;
    --component-height: 40px;
  }
}
```

## 🎯 Exemples Pratiques

### 1. Thème Gaming
```typescript
gaming: {
  name: 'Gaming',
  colors: {
    primary: '#00FF88',      // Vert néon
    secondary: '#FF0066',    // Rose électrique
    background: '#0D0D0D',   // Noir profond
    foreground: '#FFFFFF',   // Blanc pur
    card: '#1A1A1A',        // Gris très foncé
    accent: '#00FFFF',      // Cyan
    muted: '#333333',       // Gris moyen
    border: '#444444',      // Gris border
  },
  fonts: {
    display: 'Orbitron',    // Font futuriste
    body: 'Rajdhani',       // Font gaming
    mono: 'Share Tech Mono'
  },
  animations: {
    enabled: true,
    duration: 'fast'        // Animations rapides
  }
}
```

### 2. Thème Académique
```typescript
academic: {
  name: 'Academic',
  colors: {
    primary: '#1E40AF',      // Bleu académique
    secondary: '#7C2D12',    // Brun cuir
    background: '#FFFEF7',   // Blanc cassé papier
    foreground: '#1F2937',   // Gris lecture
    card: '#FFFFFF',        
    accent: '#F3F4F6',      // Gris très clair
    muted: '#E5E7EB',       // Gris clair
    border: '#D1D5DB',      // Gris border
  },
  fonts: {
    display: 'Crimson Text', // Font serif
    body: 'Source Sans Pro', // Font lisible
    mono: 'Inconsolata'      // Font mono claire
  },
  animations: {
    enabled: false           // Animations désactivées
  }
}
```

### 3. Utilisation dans Composants
```typescript
// Composant avec thème
function GameCard({ theme = 'classic' }: { theme?: string }) {
  const { applyTheme } = useTheme();
  
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return (
    <Card className={cn(
      "game-card transition-all duration-300",
      "bg-card text-card-foreground",
      "border-border shadow-lg hover:shadow-xl",
      "dark:bg-card dark:text-card-foreground"
    )}>
      <CardContent className="p-6">
        <h3 className="text-lg font-display font-semibold text-foreground">
          Quiz Card
        </h3>
        <p className="text-muted-foreground font-body">
          Contenu du quiz avec thème appliqué
        </p>
      </CardContent>
    </Card>
  );
}
```

## 🔧 Debugging des Thèmes

### Inspecteur de Variables CSS
```typescript
// Utilitaire de debug
export function debugTheme() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  const themeVariables = [
    '--background', '--foreground', '--primary', '--secondary',
    '--card', '--border', '--muted', '--accent'
  ];
  
  const values = themeVariables.reduce((acc, variable) => {
    acc[variable] = computedStyle.getPropertyValue(variable);
    return acc;
  }, {} as Record<string, string>);
  
  console.table(values);
  return values;
}
```

### Component de Prévisualisation
```typescript
function ThemePreview({ themeName }: { themeName: string }) {
  return (
    <div data-theme={themeName} className="p-6 space-y-4 border rounded-lg">
      <h4 className="text-lg font-display font-semibold">{themeName}</h4>
      
      <div className="flex gap-2">
        <Button variant="default">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
      
      <Card className="p-4">
        <p className="text-muted-foreground">
          Exemple de carte avec le thème {themeName}
        </p>
      </Card>
      
      <div className="flex gap-2">
        <Badge>Badge</Badge>
        <Badge variant="secondary">Secondary</Badge>
      </div>
    </div>
  );
}
```

## 📚 Ressources

### Outils Utiles
- [shadcn/ui Themes](https://ui.shadcn.com/themes) - Générateur de thèmes
- [TailwindCSS Color Palette](https://tailwindcss.com/docs/customizing-colors) - Palettes de couleurs
- [Coolors.co](https://coolors.co/) - Générateur de palettes
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Vérifier l'accessibilité

### Extensions VSCode
- **Tailwind CSS IntelliSense** - Autocomplétion
- **Color Highlight** - Visualiser les couleurs
- **CSS Var Complete** - Autocomplétion variables CSS

---

**🎨 Créez des thèmes magnifiques et accessibles pour une expérience utilisateur exceptionnelle !**