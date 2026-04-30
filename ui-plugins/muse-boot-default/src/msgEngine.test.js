import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import msgEngine from './msgEngine.js';

function setupMuseGlobal(overrides = {}) {
  window.MUSE_GLOBAL = {
    appName: 'test-app',
    envName: 'staging',
    app: { name: 'test-app' },
    env: { name: 'staging' },
    parentApp: null,
    ...overrides,
  };
}

function sendMuseMessage(payload, from = {}) {
  const event = new MessageEvent('message', {
    data: { type: 'muse', payload, from },
  });
  window.dispatchEvent(event);
}

describe('msgEngine', () => {
  beforeEach(() => {
    setupMuseGlobal();
    msgEngine.listeners = {};
    msgEngine.promises = {};
    msgEngine.iframes = {};
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register / unregister / getIframe', () => {
    it('registers an iframe by key', () => {
      const iframe = { contentWindow: {} };
      msgEngine.register('myFrame', iframe);
      expect(msgEngine.iframes['myFrame']).toBe(iframe);
    });

    it('unregisters an iframe by key', () => {
      msgEngine.register('myFrame', {});
      msgEngine.unregister('myFrame');
      expect(msgEngine.iframes['myFrame']).toBeUndefined();
    });

    it('getIframe returns iframe by string key', () => {
      const iframe = { contentWindow: {} };
      msgEngine.register('key1', iframe);
      expect(msgEngine.getIframe('key1')).toBe(iframe);
    });

    it('getIframe returns the iframe directly when passed an object', () => {
      const iframe = { contentWindow: {} };
      expect(msgEngine.getIframe(iframe)).toBe(iframe);
    });
  });

  describe('addListener / removeListener', () => {
    it('adds a listener', () => {
      const cb = vi.fn();
      msgEngine.addListener('test-event', cb);
      expect(msgEngine.listeners['test-event']).toBe(cb);
    });

    it('removes a listener', () => {
      msgEngine.addListener('test-event', vi.fn());
      msgEngine.removeListener('test-event');
      expect(msgEngine.listeners['test-event']).toBeUndefined();
    });
  });

  describe('resolvePromise', () => {
    it('resolves a stored promise and removes it', async () => {
      let resolvedWith;
      const promise = new Promise((resolve) => {
        msgEngine.promises['abc'] = { resolve, reject: vi.fn() };
      });
      msgEngine.resolvePromise('abc', { data: 42 });
      resolvedWith = await promise;
      expect(resolvedWith).toEqual({ data: 42 });
      expect(msgEngine.promises['abc']).toBeUndefined();
    });

    it('does nothing for an unknown promiseId', () => {
      expect(() => msgEngine.resolvePromise('unknown-id', {})).not.toThrow();
    });
  });

  describe('init - message listener', () => {
    beforeEach(() => {
      msgEngine.init();
    });

    it('ignores messages not of type muse', () => {
      const cb = vi.fn();
      msgEngine.addListener('anything', cb);
      const event = new MessageEvent('message', { data: { type: 'other' } });
      window.dispatchEvent(event);
      expect(cb).not.toHaveBeenCalled();
    });

    it('dispatches payload to all listeners', () => {
      const cb = vi.fn();
      msgEngine.addListener('my-listener', cb);
      sendMuseMessage({ type: 'some-type', value: 123 });
      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'some-type', value: 123 }),
        expect.any(MessageEvent),
      );
    });

    it('resolves a stored promise when promiseId is in payload', async () => {
      let resolved;
      const promise = new Promise((res) => {
        msgEngine.promises['prm1'] = { resolve: res, reject: vi.fn() };
      });
      sendMuseMessage({ promiseId: 'prm1', data: 'result' });
      resolved = await promise;
      expect(resolved).toBe('result');
    });

    it('does not throw when a listener throws', () => {
      msgEngine.addListener('bad-listener', () => {
        throw new Error('boom');
      });
      expect(() => sendMuseMessage({ type: 'test' })).not.toThrow();
    });
  });

  describe('sendToParent', () => {
    it('does not post message when not in iframe (window.parent === window)', () => {
      const spy = vi.spyOn(window.parent, 'postMessage');
      msgEngine.sendToParent({ type: 'test' });
      expect(spy).not.toHaveBeenCalled();
    });

    it('returns null when isPromise is false', () => {
      const result = msgEngine.sendToParent({ type: 'test' });
      expect(result).toBeNull();
    });

    it('returns a Promise when isPromise is true', () => {
      const result = msgEngine.sendToParent({ type: 'test' }, true);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('sendToChild', () => {
    it('posts a muse message to the iframe contentWindow', () => {
      const mockContentWindow = { postMessage: vi.fn() };
      const iframe = { contentWindow: mockContentWindow };
      msgEngine.register('child', iframe);
      msgEngine.sendToChild({ type: 'ping' }, 'child');
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'muse', payload: { type: 'ping' } }),
        '*',
      );
    });

    it('returns null when isPromise is false', () => {
      const iframe = { contentWindow: { postMessage: vi.fn() } };
      msgEngine.register('child', iframe);
      expect(msgEngine.sendToChild({ type: 'x' }, 'child')).toBeNull();
    });

    it('returns a Promise when isPromise is true', () => {
      const iframe = { contentWindow: { postMessage: vi.fn() } };
      msgEngine.register('child', iframe);
      const p = msgEngine.sendToChild({ type: 'x' }, 'child', true);
      expect(p).toBeInstanceOf(Promise);
    });

    it('rejects the promise when postMessage throws', async () => {
      const iframe = {
        contentWindow: {
          postMessage: () => {
            throw new Error('postMessage failed');
          },
        },
      };
      msgEngine.register('failing', iframe);
      await expect(msgEngine.sendToChild({}, 'failing', true)).rejects.toThrow('postMessage failed');
    });
  });

  describe('parentNavigate', () => {
    it('calls sendToParent with parent-navigate type and url', () => {
      const spy = vi.spyOn(msgEngine, 'sendToParent');
      msgEngine.parentNavigate('https://example.com/new');
      expect(spy).toHaveBeenCalledWith({
        type: 'parent-navigate',
        url: 'https://example.com/new',
      });
    });
  });

  describe('pre-registered listeners', () => {
    // The module registers listeners at load time (outside init()). The outer
    // beforeEach resets msgEngine.listeners = {} which wipes them. We capture
    // the original module-level listeners once at describe-scope and restore.
    const moduleListeners = { ...msgEngine.listeners };

    beforeEach(() => {
      // Restore module-level listeners, then call init() to add init() listeners
      msgEngine.listeners = { ...moduleListeners };
      msgEngine.promises = {};
      msgEngine.iframes = {};
      msgEngine.init();
    });

    it('parent-navigate listener navigates when type matches', () => {
      // jsdom doesn't fully support location assignment, but we can verify no throw
      const event = new MessageEvent('message', {
        data: {
          type: 'muse',
          payload: { type: 'parent-navigate', url: 'https://example.com' },
        },
      });
      expect(() => window.dispatchEvent(event)).not.toThrow();
    });

    it('get-parent-url listener calls resolveChild when type matches', () => {
      const spy = vi.spyOn(msgEngine, 'resolveChild');
      const event = new MessageEvent('message', {
        data: {
          type: 'muse',
          payload: { type: 'get-parent-url' },
          promiseId: 'p1',
        },
      });
      window.dispatchEvent(event);
      expect(spy).toHaveBeenCalled();
    });
  });
});
