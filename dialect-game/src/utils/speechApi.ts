/**
 * Web Speech API utilities
 * Provides utility functions for Speech Recognition API
 */

/**
 * Utility function to get the appropriate SpeechRecognition constructor
 */
export function getSpeechRecognition(): any | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

/**
 * Check if Speech Recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognition() !== null;
}

/**
 * Create a new SpeechRecognition instance
 */
export function createSpeechRecognition(): any | null {
  const SpeechRecognitionClass = getSpeechRecognition();
  return SpeechRecognitionClass ? new SpeechRecognitionClass() : null;
}