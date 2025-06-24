/**
 * Unit tests for VoiceInput component
 * Following TDD methodology - these tests will initially fail (RED phase)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VoiceInput } from '../../../src/components/VoiceInput';
import type { VoiceRecognitionState, SpeechResult, VoiceError } from '../../../src/types';

// Mock VoiceService
const mockVoiceService = {
  start: vi.fn(() => Promise.resolve()),
  stop: vi.fn(),
  abort: vi.fn(),
  setLanguage: vi.fn(),
  configure: vi.fn(),
  onResult: vi.fn(),
  onError: vi.fn(),
  onStateChange: vi.fn(),
  onEvent: vi.fn(),
  removeAllListeners: vi.fn(),
  dispose: vi.fn(),
  isSupported: vi.fn(() => true),
  state: 'idle' as VoiceRecognitionState,
  config: {
    language: 'en-US',
    continuous: true,
    interimResults: false,
    maxAlternatives: 1,
    serviceGrammars: false
  }
};

// Mock useVoiceService hook
vi.mock('../../../src/hooks/useVoiceService', () => ({
  useVoiceService: () => mockVoiceService
}));

describe('VoiceInput', () => {
  const mockOnResult = vi.fn();
  const mockOnError = vi.fn();
  const mockOnStateChange = vi.fn();

  const defaultProps = {
    onResult: mockOnResult,
    onError: mockOnError,
    onStateChange: mockOnStateChange,
    language: 'en-US',
    placeholder: 'Click to speak...',
    disabled: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockVoiceService.state = 'idle';
    mockVoiceService.isSupported.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render microphone button in idle state', () => {
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /click to speak/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Start voice recognition');
      
      const micIcon = screen.getByTestId('microphone-icon');
      expect(micIcon).toBeInTheDocument();
      expect(micIcon).not.toHaveClass('recording');
    });

    it('should show listening state when recording', () => {
      mockVoiceService.state = 'listening';
      
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Stop voice recognition');
      
      const micIcon = screen.getByTestId('microphone-icon');
      expect(micIcon).toHaveClass('recording');
      
      expect(screen.getByText(/listening/i)).toBeInTheDocument();
    });

    it('should show processing state', () => {
      mockVoiceService.state = 'processing';
      
      render(<VoiceInput {...defaultProps} />);
      
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      expect(screen.getByTestId('processing-spinner')).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockVoiceService.state = 'error';
      
      render(<VoiceInput {...defaultProps} />);
      
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('should be disabled when prop is true', () => {
      render(<VoiceInput {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should show custom placeholder', () => {
      render(<VoiceInput {...defaultProps} placeholder="Say something..." />);
      
      expect(screen.getByText(/say something/i)).toBeInTheDocument();
    });

    it('should show unsupported message when API not available', () => {
      mockVoiceService.isSupported.mockReturnValue(false);
      
      render(<VoiceInput {...defaultProps} />);
      
      expect(screen.getByText(/voice recognition not supported/i)).toBeInTheDocument();
      expect(screen.getByText(/try using a modern browser/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should start recording on button click', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockVoiceService.start).toHaveBeenCalled();
    });

    it('should stop recording when already listening', async () => {
      const user = userEvent.setup();
      mockVoiceService.state = 'listening';
      
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockVoiceService.stop).toHaveBeenCalled();
    });

    it('should start recording on spacebar press', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Space}');
      
      expect(mockVoiceService.start).toHaveBeenCalled();
    });

    it('should start recording on Enter press', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(mockVoiceService.start).toHaveBeenCalled();
    });

    it('should not respond to clicks when disabled', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} disabled={true} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockVoiceService.start).not.toHaveBeenCalled();
    });

    it('should support push-to-talk mode', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} pushToTalk={true} />);
      
      const button = screen.getByRole('button');
      
      // Mouse down should start recording
      fireEvent.mouseDown(button);
      expect(mockVoiceService.start).toHaveBeenCalled();
      
      // Mouse up should stop recording
      fireEvent.mouseUp(button);
      expect(mockVoiceService.stop).toHaveBeenCalled();
    });

    it('should handle long press on mobile', async () => {
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      fireEvent.touchStart(button);
      
      // Simulate long press (500ms)
      await waitFor(() => {
        expect(mockVoiceService.start).toHaveBeenCalled();
      }, { timeout: 600 });
      
      fireEvent.touchEnd(button);
      expect(mockVoiceService.stop).toHaveBeenCalled();
    });
  });

  describe('Voice Service Integration', () => {
    it('should configure voice service with language', () => {
      render(<VoiceInput {...defaultProps} language="fr-FR" />);
      
      expect(mockVoiceService.setLanguage).toHaveBeenCalledWith('fr-FR');
    });

    it('should update language when prop changes', () => {
      const { rerender } = render(<VoiceInput {...defaultProps} language="en-US" />);
      
      rerender(<VoiceInput {...defaultProps} language="es-ES" />);
      
      expect(mockVoiceService.setLanguage).toHaveBeenCalledWith('es-ES');
    });

    it('should handle voice recognition results', () => {
      render(<VoiceInput {...defaultProps} />);
      
      expect(mockVoiceService.onResult).toHaveBeenCalledWith(expect.any(Function));
      
      // Simulate result callback
      const resultCallback = mockVoiceService.onResult.mock.calls[0][0];
      const speechResult: SpeechResult = {
        transcript: 'hello world',
        confidence: 0.95,
        isFinal: true,
        timestamp: Date.now(),
        alternatives: [{ transcript: 'hello world', confidence: 0.95 }]
      };
      
      resultCallback(speechResult);
      
      expect(mockOnResult).toHaveBeenCalledWith(speechResult);
    });

    it('should handle voice recognition errors', () => {
      render(<VoiceInput {...defaultProps} />);
      
      expect(mockVoiceService.onError).toHaveBeenCalledWith(expect.any(Function));
      
      // Simulate error callback
      const errorCallback = mockVoiceService.onError.mock.calls[0][0];
      const voiceError: VoiceError = {
        type: 'not-allowed',
        message: 'Permission denied',
        timestamp: Date.now()
      };
      
      errorCallback(voiceError);
      
      expect(mockOnError).toHaveBeenCalledWith(voiceError);
    });

    it('should handle state changes', () => {
      render(<VoiceInput {...defaultProps} />);
      
      expect(mockVoiceService.onStateChange).toHaveBeenCalledWith(expect.any(Function));
      
      // Simulate state change callback
      const stateCallback = mockVoiceService.onStateChange.mock.calls[0][0];
      stateCallback('listening');
      
      expect(mockOnStateChange).toHaveBeenCalledWith('listening');
    });

    it('should cleanup listeners on unmount', () => {
      const { unmount } = render(<VoiceInput {...defaultProps} />);
      
      unmount();
      
      expect(mockVoiceService.removeAllListeners).toHaveBeenCalled();
    });
  });

  describe('Visual Feedback', () => {
    it('should show confidence level for results', () => {
      render(<VoiceInput {...defaultProps} showConfidence={true} />);
      
      // Simulate receiving a result with confidence
      const resultCallback = mockVoiceService.onResult.mock.calls[0][0];
      resultCallback({
        transcript: 'test',
        confidence: 0.85,
        isFinal: true,
        timestamp: Date.now(),
        alternatives: []
      });
      
      expect(screen.getByText(/85%/i)).toBeInTheDocument();
      expect(screen.getByTestId('confidence-indicator')).toBeInTheDocument();
    });

    it('should show transcript preview', () => {
      render(<VoiceInput {...defaultProps} showTranscript={true} />);
      
      // Simulate interim result
      const resultCallback = mockVoiceService.onResult.mock.calls[0][0];
      resultCallback({
        transcript: 'hello wor...',
        confidence: 0.7,
        isFinal: false,
        timestamp: Date.now(),
        alternatives: []
      });
      
      expect(screen.getByText('hello wor...')).toBeInTheDocument();
      expect(screen.getByTestId('transcript-preview')).toBeInTheDocument();
    });

    it('should show volume level indicator', () => {
      render(<VoiceInput {...defaultProps} showVolumeLevel={true} />);
      
      mockVoiceService.state = 'listening';
      
      expect(screen.getByTestId('volume-indicator')).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { name: /volume level/i })).toBeInTheDocument();
    });

    it('should animate microphone icon when listening', () => {
      mockVoiceService.state = 'listening';
      
      render(<VoiceInput {...defaultProps} />);
      
      const micIcon = screen.getByTestId('microphone-icon');
      expect(micIcon).toHaveClass('pulse-animation');
    });

    it('should show countdown timer for timeout', async () => {
      render(<VoiceInput {...defaultProps} timeout={5000} />);
      
      mockVoiceService.state = 'listening';
      
      await waitFor(() => {
        expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display permission error message', () => {
      render(<VoiceInput {...defaultProps} />);
      
      const errorCallback = mockVoiceService.onError.mock.calls[0][0];
      errorCallback({
        type: 'not-allowed',
        message: 'Permission denied',
        timestamp: Date.now()
      });
      
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
      expect(screen.getByText(/allow microphone access/i)).toBeInTheDocument();
    });

    it('should display network error message', () => {
      render(<VoiceInput {...defaultProps} />);
      
      const errorCallback = mockVoiceService.onError.mock.calls[0][0];
      errorCallback({
        type: 'network',
        message: 'Network error',
        timestamp: Date.now()
      });
      
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByText(/check your connection/i)).toBeInTheDocument();
    });

    it('should show retry button after error', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} />);
      
      const errorCallback = mockVoiceService.onError.mock.calls[0][0];
      errorCallback({
        type: 'aborted',
        message: 'Recognition aborted',
        timestamp: Date.now()
      });
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      
      await user.click(retryButton);
      expect(mockVoiceService.start).toHaveBeenCalled();
    });

    it('should auto-recover from temporary errors', async () => {
      render(<VoiceInput {...defaultProps} autoRetry={true} />);
      
      const errorCallback = mockVoiceService.onError.mock.calls[0][0];
      errorCallback({
        type: 'no-speech',
        message: 'No speech detected',
        timestamp: Date.now()
      });
      
      await waitFor(() => {
        expect(mockVoiceService.start).toHaveBeenCalledTimes(2); // Initial + retry
      }, { timeout: 2000 });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-describedby');
      
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
    });

    it('should announce state changes to screen readers', () => {
      render(<VoiceInput {...defaultProps} />);
      
      const stateCallback = mockVoiceService.onStateChange.mock.calls[0][0];
      stateCallback('listening');
      
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent(/voice recognition started/i);
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} />);
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      
      await user.keyboard('{Space}');
      expect(mockVoiceService.start).toHaveBeenCalled();
    });

    it('should have high contrast mode support', () => {
      // Mock high contrast media query
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        writable: true,
      });
      
      render(<VoiceInput {...defaultProps} />);
      
      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('high-contrast');
    });

    it('should respect reduced motion preferences', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });
      
      mockVoiceService.state = 'listening';
      render(<VoiceInput {...defaultProps} />);
      
      const micIcon = screen.getByTestId('microphone-icon');
      expect(micIcon).not.toHaveClass('pulse-animation');
    });
  });

  describe('Performance', () => {
    it('should debounce rapid button clicks', async () => {
      const user = userEvent.setup();
      render(<VoiceInput {...defaultProps} />);
      
      const button = screen.getByRole('button');
      
      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      // Should only start once due to debouncing
      expect(mockVoiceService.start).toHaveBeenCalledTimes(1);
    });

    it('should cleanup timers on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { unmount } = render(<VoiceInput {...defaultProps} timeout={5000} />);
      
      unmount();
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = (props: any) => {
        renderSpy();
        return <VoiceInput {...props} />;
      };
      
      const { rerender } = render(<TestComponent {...defaultProps} />);
      rerender(<TestComponent {...defaultProps} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});