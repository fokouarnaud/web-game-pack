// Test setup file for Vitest
import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock global objects that don't exist in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
})) as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as any;

// Mock fetch globally
global.fetch = vi.fn() as any;

// Mock Image constructor for preloading tests
(global as any).Image = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: '',
  onload: null,
  onerror: null,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock Google Analytics gtag
Object.defineProperty(window, 'gtag', {
  value: vi.fn(),
  writable: true,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test',
    language: 'en-US',
    onLine: true,
    geolocation: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
    serviceWorker: {
      register: vi.fn(() => Promise.resolve()),
      getRegistration: vi.fn(() => Promise.resolve()),
    },
  },
  writable: true,
});

// Mock performance
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  return setTimeout(() => cb(Date.now()), 16) as any;
});
global.cancelAnimationFrame = vi.fn((id: number) => clearTimeout(id as any));

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific React warnings that are expected in tests
  if (
    typeof args[0] === 'string' && 
    (
      args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: Each child in a list should have a unique "key" prop') ||
      args[0].includes('Warning: Failed prop type')
    )
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock Web Audio API
(global as any).AudioContext = vi.fn().mockImplementation(() => ({
  createMediaStreamSource: vi.fn(),
  createAnalyser: vi.fn(),
  createGain: vi.fn(),
  destination: {},
  sampleRate: 44100,
  currentTime: 0,
  state: 'running',
  close: vi.fn(),
  resume: vi.fn(),
  suspend: vi.fn(),
}));

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getVideoTracks: () => [],
      getAudioTracks: () => [{ stop: vi.fn() }],
      getTracks: () => [{ stop: vi.fn() }],
    })),
    enumerateDevices: vi.fn(() => Promise.resolve([])),
  },
  writable: true,
});

// Mock speech recognition APIs
(global as any).SpeechRecognition = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-US',
}));

(global as any).webkitSpeechRecognition = (global as any).SpeechRecognition;

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  // Reset fetch mock
  (global.fetch as any).mockClear();
  // Reset localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// Clean up after each test
afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers();
  vi.useRealTimers();
});