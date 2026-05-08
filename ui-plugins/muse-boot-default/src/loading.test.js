import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('./logo.png', () => ({ default: '/fake-logo.png' }));

import loading from './loading.js';

function setupMuseGlobal(overrides = {}) {
  window.MUSE_GLOBAL = {
    app: { name: 'test-app', config: {} },
    cdn: 'https://cdn.example.com',
    ...overrides,
  };
}

describe('loading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    delete loading.mountNode;
    delete loading.labelNode;
    document.body.className = '';
    localStorage.clear();
    setupMuseGlobal();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('appends #muse-loading-node to document.body', () => {
      loading.init();
      expect(document.getElementById('muse-loading-node')).not.toBeNull();
      expect(loading.mountNode).toBeDefined();
      expect(loading.labelNode).toBeDefined();
    });

    it('uses the fallback logo when app.iconId is not set', () => {
      loading.init();
      expect(loading.mountNode.innerHTML).toContain('/fake-logo.png');
    });

    it('uses CDN icon URL when app.iconId is set', () => {
      setupMuseGlobal({ app: { name: 'my-app', iconId: 42, config: {} }, cdn: 'https://cdn.example.com' });
      loading.init();
      expect(loading.mountNode.innerHTML).toContain('https://cdn.example.com/p/app-icon.my-app/v0.0.42/dist/icon.png');
    });

    it('adds muse-theme-dark class when app.config.theme is dark and no localStorage override', () => {
      setupMuseGlobal({ app: { name: 'test-app', config: { theme: 'dark' } }, cdn: '' });
      loading.init();
      expect(document.body.classList.contains('muse-theme-dark')).toBe(true);
    });

    it('adds muse-theme-dark class when localStorage muse.theme is dark', () => {
      localStorage.setItem('muse.theme', 'dark');
      loading.init();
      expect(document.body.classList.contains('muse-theme-dark')).toBe(true);
    });

    it('does not add muse-theme-dark when theme is light', () => {
      setupMuseGlobal({ app: { name: 'test-app', config: { theme: 'light' } }, cdn: '' });
      loading.init();
      expect(document.body.classList.contains('muse-theme-dark')).toBe(false);
    });

    it('does not add muse-theme-dark when localStorage muse.theme is light', () => {
      localStorage.setItem('muse.theme', 'light');
      loading.init();
      expect(document.body.classList.contains('muse-theme-dark')).toBe(false);
    });
  });

  describe('hide', () => {
    it('does nothing when mountNode is not set', () => {
      delete loading.mountNode;
      expect(() => loading.hide()).not.toThrow();
    });

    it('removes mountNode from document.body after timeout', () => {
      loading.init();
      expect(document.getElementById('muse-loading-node')).not.toBeNull();
      loading.hide();
      vi.advanceTimersByTime(800);
      expect(document.getElementById('muse-loading-node')).toBeNull();
      expect(loading.mountNode).toBeUndefined();
    });

    it('sets opacity to 0 after 10ms', () => {
      loading.init();
      loading.hide();
      vi.advanceTimersByTime(10);
      expect(loading.mountNode.style.opacity).toBe('0');
    });

    it('deletes labelNode immediately on hide', () => {
      loading.init();
      expect(loading.labelNode).toBeDefined();
      loading.hide();
      expect(loading.labelNode).toBeUndefined();
    });
  });

  describe('showMessage', () => {
    it('updates the label text', () => {
      loading.init();
      loading.showMessage('Loading plugins 2/5...');
      expect(loading.labelNode.innerHTML).toBe('Loading plugins 2/5...');
    });

    it('clears the label text when called with empty string', () => {
      loading.init();
      loading.showMessage('some text');
      loading.showMessage('');
      expect(loading.labelNode.innerHTML).toBe('');
    });

    it('does nothing when labelNode is not set', () => {
      delete loading.labelNode;
      expect(() => loading.showMessage('msg')).not.toThrow();
    });
  });
});
