/**
 * useVoiceService hook - React hook for VoiceService integration
 * Following TDD methodology - implementing to make tests pass (GREEN phase)
 */

import { useEffect, useRef } from 'react';
import { VoiceService } from '../services/VoiceService';
import type { IVoiceService, VoiceRecognitionConfig } from '../types';

export function useVoiceService(config?: Partial<VoiceRecognitionConfig>): IVoiceService {
  const serviceRef = useRef<VoiceService | null>(null);

  // Initialize service on first render
  if (!serviceRef.current) {
    serviceRef.current = new VoiceService(config);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.dispose();
        serviceRef.current = null;
      }
    };
  }, []);

  return serviceRef.current;
}