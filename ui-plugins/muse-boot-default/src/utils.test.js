import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./error', () => ({
  default: {
    showMessage: vi.fn(),
  },
}));

import error from './error';
import { load, loadInParallel, loadInSerial, joinPath, getPluginId } from './utils.js';

describe('joinPath', () => {
  it('joins two paths without double slash', () => {
    expect(joinPath('http://cdn.example.com', 'p/myplugin')).toBe(
      'http://cdn.example.com/p/myplugin',
    );
  });

  it('adds trailing slash to p1 if missing', () => {
    expect(joinPath('/base', 'file.js')).toBe('/base/file.js');
  });

  it('does not double-slash when p1 already ends with slash', () => {
    expect(joinPath('/base/', 'file.js')).toBe('/base/file.js');
  });

  it('strips leading slashes from p2', () => {
    expect(joinPath('/base', '/file.js')).toBe('/base/file.js');
  });

  it('strips multiple leading slashes from p2', () => {
    expect(joinPath('/base', '///file.js')).toBe('/base/file.js');
  });

  it('handles both trailing slash on p1 and leading slash on p2', () => {
    expect(joinPath('/base/', '/file.js')).toBe('/base/file.js');
  });
});

describe('getPluginId', () => {
  it('converts scoped package name to dot-notation', () => {
    expect(getPluginId('@ebay/muse-lib-react')).toBe('@ebay.muse-lib-react');
  });

  it('returns plain package name unchanged', () => {
    expect(getPluginId('my-plugin')).toBe('my-plugin');
  });

  it('handles single-level scoped package', () => {
    expect(getPluginId('@scope/pkg')).toBe('@scope.pkg');
  });
});

describe('load', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '';
  });

  it('returns undefined for a plugin with .then/.catch (promise-like)', () => {
    const fakePromise = { then: vi.fn(), catch: vi.fn() };
    const result = load(fakePromise);
    expect(result).toBeUndefined();
    expect(fakePromise.then).toHaveBeenCalled();
  });

  it('appends a script tag for a plugin with a url', () => {
    load({ url: 'https://cdn.example.com/plugin.js' });
    const scripts = document.head.querySelectorAll('script');
    expect(scripts.length).toBe(1);
    expect(scripts[0].src).toBe('https://cdn.example.com/plugin.js');
    expect(scripts[0].type).toBe('module');
    expect(scripts[0].getAttribute('crossorigin')).toBe('anonymous');
  });

  it('resolves immediately in test environment (NODE_ENV=test)', async () => {
    await expect(load({ url: 'https://cdn.example.com/plugin.js' })).resolves.toBeUndefined();
  });

  it('calls onerror handler and shows error message on script error', async () => {
    // We must call onerror manually since jsdom does not fetch scripts
    const promise = load({ url: 'https://cdn.example.com/bad.js' });
    const script = document.head.querySelector('script');
    // Simulate script error after the test-env resolve; this tests the onerror path independently
    script.onerror();
    expect(error.showMessage).toHaveBeenCalledWith(
      'Failed to load resource: https://cdn.example.com/bad.js .',
    );
    // The promise was already resolved in test env, so this should not throw
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('loadInParallel', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('loads all items and calls callback for each', async () => {
    const callback = vi.fn();
    await loadInParallel(
      [{ url: 'https://cdn.example.com/a.js' }, { url: 'https://cdn.example.com/b.js' }],
      callback,
    );
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('resolves when there are no items', async () => {
    await expect(loadInParallel([])).resolves.toBeUndefined();
  });

  it('calls callback with incrementing count', async () => {
    const counts = [];
    await loadInParallel(
      [
        { url: 'https://cdn.example.com/a.js' },
        { url: 'https://cdn.example.com/b.js' },
        { url: 'https://cdn.example.com/c.js' },
      ],
      (count) => counts.push(count),
    );
    expect(counts).toHaveLength(3);
    expect(counts.every((c) => c >= 1 && c <= 3)).toBe(true);
  });
});

describe('loadInSerial', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('loads items one after another and calls callback in order', async () => {
    const counts = [];
    await loadInSerial(
      [{ url: 'https://cdn.example.com/a.js' }, { url: 'https://cdn.example.com/b.js' }],
      (count) => counts.push(count),
    );
    expect(counts).toEqual([1, 2]);
  });

  it('resolves when there are no items', async () => {
    await expect(loadInSerial([])).resolves.toBeUndefined();
  });
});
