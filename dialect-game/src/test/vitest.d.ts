/// <reference types="vitest/globals" />
/// <reference types="vitest" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends TestingLibraryMatchers<T, void> {}
  }
}

// Import des types Vitest
import 'vitest';

// Export pour s'assurer que les types sont disponibles
export {};