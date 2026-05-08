import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./msgEngine', () => ({
  default: {
    sendToParent: vi.fn(),
    addListener: vi.fn(),
  },
}));

import msgEngine from './msgEngine.js';

describe('urlListener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('patches window.history.pushState to dispatch muse_boot_pushstate event', async () => {
    // Import urlListener as a side-effect module
    await import('./urlListener.js');

    const eventSpy = vi.fn();
    window.addEventListener('muse_boot_pushstate', eventSpy);

    window.history.pushState({ key: 'val' }, '', '/new-path');

    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(eventSpy.mock.calls[0][0].state).toEqual({ key: 'val' });

    window.removeEventListener('muse_boot_pushstate', eventSpy);
  });

  it('patches window.history.replaceState to dispatch muse_boot_replacestate event', async () => {
    await import('./urlListener.js');

    const eventSpy = vi.fn();
    window.addEventListener('muse_boot_replacestate', eventSpy);

    window.history.replaceState({ replaced: true }, '', '/replaced');

    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect(eventSpy.mock.calls[0][0].state).toEqual({ replaced: true });

    window.removeEventListener('muse_boot_replacestate', eventSpy);
  });

  it('calls msgEngine.sendToParent with child-route-change on muse_boot_pushstate', async () => {
    await import('./urlListener.js');

    window.history.pushState({}, '', '/some-route');

    expect(msgEngine.sendToParent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'child-route-change' }),
    );
  });

  it('calls msgEngine.sendToParent with child-route-change on popstate', async () => {
    await import('./urlListener.js');

    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));

    expect(msgEngine.sendToParent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'child-route-change' }),
    );
  });
});
