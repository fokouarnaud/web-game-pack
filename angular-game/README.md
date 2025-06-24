# Angular Dialect Game Frontend

## Overview

Modern Angular 18 frontend for the Dialect Game language learning application, featuring standalone components, signals, and advanced voice recognition capabilities.

## Features

- **Angular 18**: Latest Angular with standalone components and signals
- **Angular Material**: Modern Material Design UI components
- **NgRx**: State management with signals integration
- **Voice Recognition**: Web Speech API integration for pronunciation practice
- **Progressive Web App**: Service Worker support for offline functionality
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: WCAG AA compliant with screen reader support
- **TypeScript**: Strict type safety and modern ES features

## Technology Stack

- **Framework**: Angular 18
- **UI Library**: Angular Material 18
- **State Management**: NgRx 18 with signals
- **Styling**: SCSS with Material Theme
- **Testing**: Jest + Cypress
- **Build Tool**: Angular CLI with esbuild

## Architecture

### Project Structure
```
src/
├── app/
│   ├── core/                 # Core services, guards, interceptors
│   │   ├── models/          # TypeScript interfaces
│   │   ├── services/        # Injectable services
│   │   ├── guards/          # Route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   └── store/           # Global NgRx store
│   ├── shared/              # Shared components, pipes, directives
│   │   └── components/      # Reusable UI components
│   ├── features/            # Feature modules (lazy-loaded)
│   │   ├── auth/           # Authentication features
│   │   ├── lessons/        # Lesson management
│   │   ├── voice/          # Voice recognition
│   │   └── progress/       # User progress tracking
│   └── layout/             # App shell components
├── assets/                 # Static assets
├── environments/          # Environment configurations
└── styles.scss           # Global styles
```

### Key Features

#### 1. Standalone Components
All components use Angular 18's standalone API:
```typescript
@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `...`
})
export class LessonComponent { }
```

#### 2. Signals Integration
Modern reactive state management with signals:
```typescript
export class VoiceService {
  private readonly recordingStateSignal = signal<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false
  });

  public readonly recordingState = computed(() => this.recordingStateSignal());
}
```

#### 3. Voice Recognition
Advanced Web Speech API integration:
- Real-time audio recording
- Audio processing and transcription
- Pronunciation scoring
- Volume level monitoring
- Browser compatibility checks

#### 4. NgRx Store
Comprehensive state management:
- Authentication state
- Lesson data and progress
- Voice session management
- UI state (loading, errors)

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Development server**
   ```bash
   npm start
   ```
   Application will be available at `http://localhost:4200`

3. **Build for production**
   ```bash
   npm run build:prod
   ```

### Environment Configuration

Create environment files in `src/environments/`:

**environment.ts** (development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  features: {
    voiceRecognition: true,
    offlineMode: false
  }
};
```

**environment.prod.ts** (production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.dialectgame.com/api',
  features: {
    voiceRecognition: true,
    offlineMode: true
  }
};
```

## Core Services

### AuthService
Handles user authentication with JWT tokens:
```typescript
// Login
this.authService.login({ identifier: 'user@example.com', password: 'password' })
  .subscribe(response => {
    // User authenticated
  });

// Check authentication status
const isAuthenticated = this.authService.isAuthenticated();
```

### VoiceService
Manages voice recording and processing:
```typescript
// Start recording
await this.voiceService.startRecording({ language: 'fr-FR' });

// Process recording
this.voiceService.processRecording({
  sessionType: VoiceSessionType.PRONUNCIATION,
  expectedText: 'Bonjour le monde'
}).subscribe(response => {
  console.log('Transcription:', response.transcribedText);
  console.log('Score:', response.pronunciationScore);
});
```

### ThemeService
Manages light/dark theme switching:
```typescript
// Toggle theme
this.themeService.toggleTheme();

// Check current theme
const isDark = this.themeService.isDarkTheme();
```

## Component Examples

### Voice Recording Component
```typescript
@Component({
  selector: 'app-voice-recorder',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button 
      mat-fab 
      [color]="voiceService.recordingState().isRecording ? 'warn' : 'primary'"
      (click)="toggleRecording()">
      <mat-icon>{{voiceService.recordingState().isRecording ? 'stop' : 'mic'}}</mat-icon>
    </button>
    
    <div *ngIf="voiceService.recordingState().isRecording" class="recording-indicator">
      Recording... {{voiceService.recordingState().duration | async | date:'mm:ss'}}
    </div>
  `
})
export class VoiceRecorderComponent {
  constructor(public voiceService: VoiceService) {}

  async toggleRecording() {
    if (this.voiceService.recordingState().isRecording) {
      this.voiceService.stopRecording();
    } else {
      await this.voiceService.startRecording();
    }
  }
}
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## Building for Production

### Standard Build
```bash
npm run build:prod
```

### Bundle Analysis
```bash
npm run analyze
```

## PWA Features

The application includes Progressive Web App capabilities:
- Service Worker for caching
- Offline functionality
- Install prompt
- Background sync

## Accessibility

The application follows WCAG AA guidelines:
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast themes
- Screen reader compatibility

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Voice Features Support
- Web Speech API required for voice recognition
- MediaRecorder API required for audio recording
- Modern browsers with microphone access

## Performance Optimizations

- Lazy loading of feature modules
- OnPush change detection strategy
- Image optimization and lazy loading
- Bundle splitting and tree shaking
- Service Worker caching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow Angular style guide
4. Write tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or questions:
- Create an issue on GitHub
- Contact: support@dialectgame.com

## Deployment

### Development
The app is configured for deployment to various platforms:
- Vercel (recommended)
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

### Build Configuration
Optimize for production with:
- Bundle size optimization
- Tree shaking
- Dead code elimination
- Image optimization
- Progressive loading