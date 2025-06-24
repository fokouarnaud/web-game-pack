/**
 * LanguageSelector - Modern language selection component
 * Intégration avec TranslateAPI pour les langues supportées
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { translateApi, type LanguageInfo } from '../../services/api/translateApi';

export interface LanguageSelectorProps {
  onLanguageSelect: (sourceLanguage: string, targetLanguage: string) => void;
  selectedSource?: string;
  selectedTarget?: string;
  className?: string;
  title?: string;
  mode?: 'horizontal' | 'vertical';
}

// Type étendu avec la propriété flag
interface ExtendedLanguageInfo extends LanguageInfo {
  flag: string;
}

interface SelectorState {
  languages: ExtendedLanguageInfo[];
  isLoading: boolean;
  error: string | null;
  sourceLanguage: string;
  targetLanguage: string;
}

const POPULAR_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
];

export const LanguageSelector = React.forwardRef<HTMLDivElement, LanguageSelectorProps>(({
  onLanguageSelect,
  selectedSource = 'en',
  selectedTarget = 'es',
  className,
  title = 'Select Languages',
  mode = 'horizontal'
}, ref) => {
  const [state, setState] = useState<SelectorState>({
    languages: POPULAR_LANGUAGES as ExtendedLanguageInfo[],
    isLoading: true,
    error: null,
    sourceLanguage: selectedSource,
    targetLanguage: selectedTarget
  });

  useEffect(() => {
    loadSupportedLanguages();
  }, []);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      sourceLanguage: selectedSource,
      targetLanguage: selectedTarget
    }));
  }, [selectedSource, selectedTarget]);

  const loadSupportedLanguages = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const supportedLanguages = await translateApi.getSupportedLanguages();
      
      // Merge with popular languages to add flags and ensure they're available
      const enhancedLanguages: ExtendedLanguageInfo[] = supportedLanguages.map(lang => {
        const popular = POPULAR_LANGUAGES.find(p => p.code === lang.code);
        return {
          ...lang,
          flag: popular?.flag || '🌐'
        };
      });

      // Add any popular languages that might be missing
      const existingCodes = new Set(enhancedLanguages.map(l => l.code));
      const missingPopular = POPULAR_LANGUAGES.filter(p => !existingCodes.has(p.code));
      
      const finalLanguages = [
        ...enhancedLanguages,
        ...missingPopular.map(p => ({ code: p.code, name: p.name, flag: p.flag }))
      ].sort((a, b) => a.name.localeCompare(b.name));

      setState(prev => ({
        ...prev,
        languages: finalLanguages,
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to load languages:', error);
      setState(prev => ({
        ...prev,
        languages: POPULAR_LANGUAGES as ExtendedLanguageInfo[],
        isLoading: false,
        error: 'Using default languages due to API error'
      }));
    }
  };

  const handleSourceLanguageSelect = (languageCode: string) => {
    const newTargetLanguage = languageCode === state.targetLanguage 
      ? (state.sourceLanguage === 'en' ? 'es' : 'en') 
      : state.targetLanguage;

    setState(prev => ({
      ...prev,
      sourceLanguage: languageCode,
      targetLanguage: newTargetLanguage
    }));

    onLanguageSelect(languageCode, newTargetLanguage);
  };

  const handleTargetLanguageSelect = (languageCode: string) => {
    const newSourceLanguage = languageCode === state.sourceLanguage 
      ? (state.targetLanguage === 'en' ? 'es' : 'en') 
      : state.sourceLanguage;

    setState(prev => ({
      ...prev,
      sourceLanguage: newSourceLanguage,
      targetLanguage: languageCode
    }));

    onLanguageSelect(newSourceLanguage, languageCode);
  };

  const handleSwapLanguages = () => {
    const newSource = state.targetLanguage;
    const newTarget = state.sourceLanguage;
    
    setState(prev => ({
      ...prev,
      sourceLanguage: newSource,
      targetLanguage: newTarget
    }));

    onLanguageSelect(newSource, newTarget);
  };

  const getLanguageByCode = (code: string): ExtendedLanguageInfo => {
    return state.languages.find(lang => lang.code === code) || 
           POPULAR_LANGUAGES.find(lang => lang.code === code) as ExtendedLanguageInfo ||
           { code, name: code.toUpperCase(), flag: '🌐' };
  };

  const renderLanguageGrid = (
    selectedLanguage: string,
    onLanguageClick: (code: string) => void,
    title: string
  ) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {state.languages.map((language) => (
          <Button
            key={language.code}
            variant={selectedLanguage === language.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLanguageClick(language.code)}
            className={cn(
              "h-auto p-2 text-left justify-start",
              selectedLanguage === language.code && "ring-2 ring-primary ring-offset-1"
            )}
            disabled={state.isLoading}
          >
            <div className="flex items-center gap-2 w-full">
              <span className="text-lg flex-shrink-0">{language.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{language.name}</div>
                <div className="text-xs text-muted-foreground uppercase">{language.code}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  if (state.isLoading) {
    return (
      <Card ref={ref} className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{title}</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading supported languages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isHorizontal = mode === 'horizontal';

  return (
    <Card ref={ref} className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {state.error && (
            <Badge variant="secondary" className="text-xs">
              Offline Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Selection Display */}
        <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl mb-1">
              {getLanguageByCode(state.sourceLanguage).flag}
            </div>
            <div className="font-medium">
              {getLanguageByCode(state.sourceLanguage).name}
            </div>
            <div className="text-xs text-muted-foreground">
              {state.sourceLanguage}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSwapLanguages}
            className="rounded-full h-10 w-10 p-0"
            title="Swap languages"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </Button>
          
          <div className="text-center">
            <div className="text-2xl mb-1">
              {getLanguageByCode(state.targetLanguage).flag}
            </div>
            <div className="font-medium">
              {getLanguageByCode(state.targetLanguage).name}
            </div>
            <div className="text-xs text-muted-foreground">
              {state.targetLanguage}
            </div>
          </div>
        </div>

        {/* Language Selection Grids */}
        <div className={cn(
          "grid gap-6",
          isHorizontal ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        )}>
          {renderLanguageGrid(
            state.sourceLanguage,
            handleSourceLanguageSelect,
            "Source Language"
          )}
          
          {renderLanguageGrid(
            state.targetLanguage,
            handleTargetLanguageSelect,
            "Target Language"
          )}
        </div>

        {/* Status Messages */}
        {state.error && (
          <div className="text-center text-sm text-muted-foreground">
            <p>{state.error}</p>
          </div>
        )}

        {!state.error && (
          <div className="text-center text-xs text-muted-foreground">
            {state.languages.length} languages available
          </div>
        )}
      </CardContent>
    </Card>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

export default LanguageSelector;