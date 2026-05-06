import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./loading', () => ({
  default: {
    showMessage: vi.fn(),
  },
}));

import loading from './loading.js';
import registerSw from './registerSw.js';

function setupMuseGlobal(overrides = {}) {
  window.MUSE_GLOBAL = { serviceWorker: null, ...overrides };
}

describe('registerSw', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMuseGlobal();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete navigator.serviceWorker;
  });

  it('returns undefined when navigator.serviceWorker is not available', () => {
    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true });
    const result = registerSw();
    expect(result).toBeUndefined();
  });

  it('returns undefined when MUSE_GLOBAL.serviceWorker is falsy', () => {
    Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true });
    setupMuseGlobal({ serviceWorker: null });
    const result = registerSw();
    expect(result).toBeUndefined();
  });

  it('returns undefined when protocol is not https', () => {
    Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true });
    setupMuseGlobal({ serviceWorker: '/sw.js' });
    // jsdom default protocol is http
    const result = registerSw();
    expect(result).toBeUndefined();
  });

  it('registers service worker when conditions are met (https)', async () => {
    const mockRegister = vi.fn().mockResolvedValue({});
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true,
    });
    setupMuseGlobal({ serviceWorker: '/sw.js' });

    // Simulate https protocol
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'https:' },
      configurable: true,
    });

    const promise = registerSw();
    expect(promise).toBeInstanceOf(Promise);
    expect(loading.showMessage).toHaveBeenCalledWith('Registering Muse service worker.');
    await promise;
    expect(mockRegister).toHaveBeenCalledWith('/sw.js', {});

    // Restore location
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'http:' },
      configurable: true,
    });
  });

  it('resolves even when service worker registration fails', async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error('SW error'));
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true,
    });
    setupMuseGlobal({ serviceWorker: '/sw.js' });
    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'https:' },
      configurable: true,
    });

    await expect(registerSw()).resolves.toBeUndefined();

    Object.defineProperty(window, 'location', {
      value: { ...window.location, protocol: 'http:' },
      configurable: true,
    });
  });
});
