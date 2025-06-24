import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, throwError, from, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { 
  VoiceProcessingRequest, 
  VoiceProcessingResponse, 
  VoiceRecordingConfig, 
  VoiceRecordingState,
  VoiceSessionType 
} from '@core/models/voice.model';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private readonly baseUrl = `${environment.apiUrl}/voice`;
  
  // Voice recording state
  private readonly recordingStateSignal = signal<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    duration: 0,
    volume: 0,
    hasError: false
  });

  // Media recording
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime = 0;
  private volumeAnalyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;

  // Subjects for real-time updates
  private readonly volumeLevelSubject = new BehaviorSubject<number>(0);
  private readonly recordingTimerSubject = new Subject<number>();

  // Public observables
  public readonly recordingState = computed(() => this.recordingStateSignal());
  public readonly volumeLevel$ = this.volumeLevelSubject.asObservable();
  public readonly recordingTimer$ = this.recordingTimerSubject.asObservable();

  // Speech Recognition API
  private speechRecognition: any = null;
  private isRecognitionSupported = false;

  constructor(private http: HttpClient) {
    this.initializeSpeechRecognition();
  }

  // Initialize Web Speech API
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.speechRecognition = new (window as any).webkitSpeechRecognition();
      this.isRecognitionSupported = true;
    } else if ('SpeechRecognition' in window) {
      this.speechRecognition = new (window as any).SpeechRecognition();
      this.isRecognitionSupported = true;
    }

    if (this.speechRecognition) {
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = true;
    }
  }

  // Check if voice features are supported
  isVoiceSupported(): boolean {
    return this.isRecognitionSupported && 'MediaRecorder' in window;
  }

  // Start recording audio
  async startRecording(config: Partial<VoiceRecordingConfig> = {}): Promise<void> {
    if (!this.isVoiceSupported()) {
      throw new Error('Voice recording is not supported in this browser');
    }

    const defaultConfig: VoiceRecordingConfig = {
      maxDuration: environment.voice.maxRecordingTime,
      silenceThreshold: environment.voice.silenceThreshold,
      language: 'fr-FR',
      enableEchoCancellation: true,
      enableNoiseSuppression: true,
      enableAutoGainControl: true
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: finalConfig.enableEchoCancellation,
          noiseSuppression: finalConfig.enableNoiseSuppression,
          autoGainControl: finalConfig.enableAutoGainControl
        }
      });

      // Setup audio analysis
      this.setupAudioAnalysis(stream);

      // Setup media recorder
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      // Start recording
      this.mediaRecorder.start();
      this.recordingStartTime = Date.now();

      // Update state
      this.recordingStateSignal.update(state => ({
        ...state,
        isRecording: true,
        hasError: false,
        duration: 0
      }));

      // Start timer
      this.startRecordingTimer();

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.recordingStateSignal().isRecording) {
          this.stopRecording();
        }
      }, finalConfig.maxDuration);

    } catch (error) {
      this.recordingStateSignal.update(state => ({
        ...state,
        hasError: true,
        errorMessage: 'Failed to access microphone: ' + (error as Error).message
      }));
      throw error;
    }
  }

  // Stop recording
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      
      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    // Stop audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.recordingStateSignal.update(state => ({
      ...state,
      isRecording: false
    }));
  }

  // Process recorded audio
  processRecording(request: VoiceProcessingRequest): Observable<VoiceProcessingResponse> {
    if (this.audioChunks.length === 0) {
      return throwError(() => new Error('No audio data to process'));
    }

    this.recordingStateSignal.update(state => ({
      ...state,
      isProcessing: true
    }));

    // Create audio blob
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
    
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('sessionType', request.sessionType);
    
    if (request.expectedText) {
      formData.append('expectedText', request.expectedText);
    }
    if (request.language) {
      formData.append('language', request.language);
    }
    if (request.lessonId) {
      formData.append('lessonId', request.lessonId.toString());
    }

    return this.http.post<VoiceProcessingResponse>(`${this.baseUrl}/process`, formData).pipe(
      tap(() => {
        this.recordingStateSignal.update(state => ({
          ...state,
          isProcessing: false
        }));
      }),
      catchError(error => {
        this.recordingStateSignal.update(state => ({
          ...state,
          isProcessing: false,
          hasError: true,
          errorMessage: 'Failed to process audio: ' + error.message
        }));
        return throwError(() => error);
      })
    );
  }

  // Real-time speech recognition
  startSpeechRecognition(language = 'fr-FR'): Observable<string> {
    if (!this.speechRecognition) {
      return throwError(() => new Error('Speech recognition not supported'));
    }

    return new Observable(observer => {
      this.speechRecognition.lang = language;
      this.speechRecognition.start();

      this.speechRecognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        observer.next(finalTranscript || interimTranscript);

        if (finalTranscript) {
          observer.complete();
        }
      };

      this.speechRecognition.onerror = (event: any) => {
        observer.error(new Error(`Speech recognition error: ${event.error}`));
      };

      this.speechRecognition.onend = () => {
        observer.complete();
      };

      // Cleanup function
      return () => {
        if (this.speechRecognition) {
          this.speechRecognition.stop();
        }
      };
    });
  }

  // Get user voice sessions
  getUserVoiceSessions(): Observable<VoiceProcessingResponse[]> {
    return this.http.get<VoiceProcessingResponse[]>(`${this.baseUrl}/sessions`);
  }

  // Private helper methods
  private setupAudioAnalysis(stream: MediaStream): void {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.volumeAnalyser = this.audioContext.createAnalyser();
    
    this.volumeAnalyser.fftSize = 256;
    source.connect(this.volumeAnalyser);

    this.monitorVolume();
  }

  private monitorVolume(): void {
    if (!this.volumeAnalyser) return;

    const bufferLength = this.volumeAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVolume = () => {
      if (this.recordingStateSignal().isRecording && this.volumeAnalyser) {
        this.volumeAnalyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        
        const average = sum / bufferLength;
        const volume = Math.round((average / 255) * 100);
        
        this.volumeLevelSubject.next(volume);
        
        requestAnimationFrame(updateVolume);
      }
    };

    updateVolume();
  }

  private startRecordingTimer(): void {
    const updateTimer = () => {
      if (this.recordingStateSignal().isRecording) {
        const duration = Date.now() - this.recordingStartTime;
        
        this.recordingStateSignal.update(state => ({
          ...state,
          duration
        }));
        
        this.recordingTimerSubject.next(duration);
        
        setTimeout(updateTimer, 100);
      }
    };

    updateTimer();
  }

  private handleRecordingStop(): void {
    this.recordingStateSignal.update(state => ({
      ...state,
      isRecording: false
    }));
  }

  // Reset recording state
  resetRecordingState(): void {
    this.audioChunks = [];
    this.recordingStateSignal.set({
      isRecording: false,
      isProcessing: false,
      duration: 0,
      volume: 0,
      hasError: false
    });
    this.volumeLevelSubject.next(0);
  }
}