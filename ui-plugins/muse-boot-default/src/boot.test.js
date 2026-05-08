import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@ebay/muse-modules', () => ({
  default: {
    register: vi.fn(),
    require: vi.fn(),
    parseMuseId: vi.fn(),
  },
}));

vi.mock('./loading', () => ({
  default: {
    init: vi.fn(),
    hide: vi.fn(),
    showMessage: vi.fn(),
  },
}));

vi.mock('./error', () => ({
  default: {
    showMessage: vi.fn(),
  },
}));

vi.mock('./registerSw', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./msgEngine', () => ({
  default: {
    init: vi.fn(),
    sendToParent: vi.fn(),
    addListener: vi.fn(),
  },
}));

vi.mock('./utils', () => ({
  loadInParallel: vi.fn().mockResolvedValue(undefined),
  loadInSerial: vi.fn().mockResolvedValue(undefined),
  getPluginId: vi.fn((name) => (name.startsWith('@') ? name.replace('/', '.') : name)),
}));

vi.mock('./urlListener', () => ({}));
vi.mock('./style.css', () => ({}));

import loading from './loading.js';
import error from './error.js';
import msgEngine from './msgEngine.js';
import { bootstrap } from './boot.js';

function makeMuseGlobal(overrides = {}) {
  return {
    app: { name: 'test-app', config: {} },
    env: { name: 'staging', config: {} },
    cdn: 'https://cdn.example.com',
    plugins: [],
    appEntries: [],
    initEntries: [],
    pluginEntries: [],
    waitForLoaders: [],
    isDev: false,
    isE2eTest: false,
    __onMusePluginsLoaded: null,
    ...overrides,
  };
}

// Helper: bootstrap resolves after all microtasks/timers flush
async function runBootstrap() {
  bootstrap();
  // Flush the promise chain (start() is async)
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('bootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    sessionStorage.clear();
    window.MUSE_GLOBAL = makeMuseGlobal();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.MUSE_CONFIG;
  });

  it('throws when window.MUSE_GLOBAL is not set', () => {
    delete window.MUSE_GLOBAL;
    expect(() => bootstrap()).toThrow('There must be a global window.MUSE_GLOBAL object');
  });

  it('calls loading.init and msgEngine.init', () => {
    // Need at least one app entry to avoid an error in start()
    window.MUSE_GLOBAL.appEntries = [{ name: 'main', func: vi.fn().mockResolvedValue(undefined) }];
    // Make script loading resolve by auto-triggering __onMusePluginsLoaded
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });
    bootstrap();
    expect(loading.init).toHaveBeenCalledTimes(1);
    expect(msgEngine.init).toHaveBeenCalledTimes(1);
  });

  it('dispatches muse_boot_completed CustomEvent on success', async () => {
    const entry = vi.fn().mockResolvedValue(undefined);
    window.MUSE_GLOBAL.appEntries = [{ name: 'main', func: entry }];
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    const eventSpy = vi.fn();
    window.addEventListener('muse_boot_completed', eventSpy);

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(eventSpy).toHaveBeenCalledTimes(1);
    const detail = eventSpy.mock.calls[0][0].detail;
    expect(detail.result).toBe('success');
    expect(detail.metrics[0].name).toBe('app-start-result');
    expect(detail.metrics[0].payload.status).toBe('success');

    window.removeEventListener('muse_boot_completed', eventSpy);
  });

  it('dispatches muse_boot_completed with failure on start() error', async () => {
    // No app entries => start() throws "No app entry found"
    window.MUSE_GLOBAL.appEntries = [];
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    const eventSpy = vi.fn();
    window.addEventListener('muse_boot_completed', eventSpy);

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const detail = eventSpy.mock.calls[0][0].detail;
    expect(detail.result).toBe('failure');
    expect(detail.metrics[0].payload.status).toBe('failure');

    window.removeEventListener('muse_boot_completed', eventSpy);
  });

  it('sends app-state-change: app-loaded on success', async () => {
    window.MUSE_GLOBAL.appEntries = [{ name: 'main', func: vi.fn().mockResolvedValue(undefined) }];
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(msgEngine.sendToParent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'app-state-change', state: 'app-loaded' }),
    );
  });

  it('sends app-state-change: app-failed on failure', async () => {
    window.MUSE_GLOBAL.appEntries = [];
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(msgEngine.sendToParent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'app-state-change', state: 'app-failed' }),
    );
  });

  it('shows error message when start() rejects with a message', async () => {
    window.MUSE_GLOBAL.appEntries = [];
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(error.showMessage).toHaveBeenCalled();
  });

  it('sets window.MUSE_CONFIG for backward compatibility', async () => {
    window.MUSE_GLOBAL.appEntries = [{ name: 'main', func: vi.fn().mockResolvedValue(undefined) }];
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(window.MUSE_CONFIG).toBe(window.MUSE_GLOBAL);
  });

  it('redirects and returns early when MUSE_TEMP_temp-redirect-url is set', async () => {
    sessionStorage.setItem('MUSE_TEMP_temp-redirect-url', 'https://redirect.example.com');
    const entry = vi.fn();
    window.MUSE_GLOBAL.appEntries = [{ name: 'main', func: entry }];

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // start() returned early, so the app entry was never called
    expect(entry).not.toHaveBeenCalled();
    // sessionStorage key is removed
    expect(sessionStorage.getItem('MUSE_TEMP_temp-redirect-url')).toBeNull();
  });

  it('enriches MUSE_GLOBAL with appConfig merging env over app config', async () => {
    window.MUSE_GLOBAL = makeMuseGlobal({
      app: { name: 'test-app', config: { theme: 'light', timeout: 30 } },
      env: { name: 'staging', config: { timeout: 60, emptyVal: '' } },
      appEntries: [{ name: 'main', func: vi.fn().mockResolvedValue(undefined) }],
    });
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // env.timeout overrides app.timeout; empty string in env is skipped
    expect(window.MUSE_GLOBAL.appConfig.timeout).toBe(60);
    expect(window.MUSE_GLOBAL.appConfig.theme).toBe('light');
  });

  it('exposes waitFor function that pushes to waitForLoaders', async () => {
    const loader = vi.fn().mockResolvedValue(undefined);
    window.MUSE_GLOBAL.appEntries = [{ name: 'main', func: vi.fn().mockResolvedValue(undefined) }];
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        // Register a waitFor before plugins are loaded
        window.MUSE_GLOBAL.waitFor(loader);
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(loader).toHaveBeenCalledTimes(1);
  });
});

describe('bootstrap - appConfig.entry selection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '';
    sessionStorage.clear();
    vi.spyOn(document.head, 'appendChild').mockImplementation((el) => {
      if (el.tagName === 'SCRIPT' && el.textContent?.includes('__onMusePluginsLoaded')) {
        window.MUSE_GLOBAL.__onMusePluginsLoaded?.();
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses appConfig.entry when specified', async () => {
    const entry1 = vi.fn().mockResolvedValue(undefined);
    const entry2 = vi.fn().mockResolvedValue(undefined);
    window.MUSE_GLOBAL = makeMuseGlobal({
      app: { name: 'test-app', config: { entry: 'entry2' } },
      appEntries: [
        { name: 'entry1', func: entry1 },
        { name: 'entry2', func: entry2 },
      ],
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(entry2).toHaveBeenCalledTimes(1);
    expect(entry1).not.toHaveBeenCalled();
  });

  it('auto-selects the single entry when no appConfig.entry and one entry', async () => {
    const entry = vi.fn().mockResolvedValue(undefined);
    window.MUSE_GLOBAL = makeMuseGlobal({
      appEntries: [{ name: 'only-entry', func: entry }],
    });

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(entry).toHaveBeenCalledTimes(1);
  });

  it('throws when multiple app entries and no entry configured', async () => {
    window.MUSE_GLOBAL = makeMuseGlobal({
      appEntries: [
        { name: 'e1', func: vi.fn() },
        { name: 'e2', func: vi.fn() },
      ],
    });

    const eventSpy = vi.fn();
    window.addEventListener('muse_boot_completed', eventSpy);

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const detail = eventSpy.mock.calls[0][0].detail;
    expect(detail.result).toBe('failure');
    expect(detail.metrics[0].payload.errorMsg).toContain('Multiple entries found');

    window.removeEventListener('muse_boot_completed', eventSpy);
  });

  it('throws when specified entry is not found in appEntries', async () => {
    window.MUSE_GLOBAL = makeMuseGlobal({
      app: { name: 'test-app', config: { entry: 'missing-entry' } },
      appEntries: [{ name: 'other-entry', func: vi.fn() }],
    });

    const eventSpy = vi.fn();
    window.addEventListener('muse_boot_completed', eventSpy);

    bootstrap();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const detail = eventSpy.mock.calls[0][0].detail;
    expect(detail.result).toBe('failure');
    expect(detail.metrics[0].payload.errorMsg).toContain('missing-entry');

    window.removeEventListener('muse_boot_completed', eventSpy);
  });
});
