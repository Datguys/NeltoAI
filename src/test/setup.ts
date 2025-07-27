import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_FIREBASE_API_KEY: 'test-api-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    VITE_FIREBASE_APP_ID: 'test-app-id',
    VITE_OPENROUTER_API_KEY: 'test-openrouter-key',
    VITE_GROQ_API_KEY: 'test-groq-key',
  },
  writable: true,
});

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
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock fetch API
global.fetch = vi.fn();

// Mock StorageEvent for jsdom compatibility
global.StorageEvent = class MockStorageEvent extends Event implements StorageEvent {
  key: string | null;
  newValue: string | null;
  oldValue: string | null;
  storageArea: Storage | null;
  url: string;

  constructor(type: string, init?: StorageEventInit) {
    super(type, init);
    this.key = init?.key || null;
    this.newValue = init?.newValue || null;
    this.oldValue = init?.oldValue || null;
    this.storageArea = init?.storageArea || null;
    this.url = init?.url || '';
  }

  initStorageEvent(): void {
    // Required by StorageEvent interface
  }
} as any;

// Set up DOM container for tests
beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  document.body.innerHTML = '';
});