import { screen, waitFor } from '@testing-library/react';
import msgEngine from '../src/msgEngine';

describe('urlListener', () => {
  const { location } = window;
  require('../src/urlListener');

  beforeAll(() => {
    delete window.location;
    window.location = {
      protocol: 'https:',
      href: 'https://localhost:3000/newPathname',
      origin: 'https://localhost:3000',
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    window.location = location;
  });

  it('muse_boot_pushstate', async () => {
    const msgEngineSpy = jest.spyOn(msgEngine, 'sendToParent');
    window.history.pushState({}, '', '/newPathname');
    // msgEngine should be called with the patched pushState
    await waitFor(() =>
      expect(msgEngineSpy).toHaveBeenCalledWith({
        type: 'child-route-change',
        path: '/newPathname',
      }),
    );
  });
});
