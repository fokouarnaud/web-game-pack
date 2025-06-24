/**
 * Test wrapper pour LandingPage avec ThemeProvider
 * Fichier temporaire pour valider l'intégration
 */

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import LandingPage from './LandingPage';

export const LandingPageTest: React.FC = () => {
  return (
    <ThemeProvider>
      <LandingPage />
    </ThemeProvider>
  );
};

export default LandingPageTest;
