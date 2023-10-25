import { screen, waitFor } from '@testing-library/react';

describe('start', () => {
  const { location } = window;
  const appConfig = { theme: 'dark', entry: 'muse-boot-default' };
  const envConfig = { name: 'test' };
  const mg = {
    app: { config: appConfig },
    env: { config: envConfig },
    appEntries: [{ name: 'muse-boot-default', func: jest.fn() }],
    serviceWorker: jest.fn(),
  };
  Object.defineProperty(window, 'MUSE_GLOBAL', { value: mg });
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: {
      register: () => {
        return new Promise((resolve) => {
          resolve();
        });
      },
    },
  });

  beforeAll(() => {
    delete window.location;
    window.location = { protocol: 'https:' };
  });

  afterAll(() => {
    window.location = location;
  });

  it('should set appConfig on MUSE_GLOBAL', async () => {
    await require('../src/index.js');
    expect(mg.appConfig).toEqual({ entry: 'muse-boot-default', name: 'test', theme: 'dark' });
    expect(document.body.classList.contains('muse-theme-dark')).toBe(true);
    await waitFor(() =>
      expect(screen.queryByRole('img', { name: 'logo' })).not.toBeInTheDocument(),
    );
  });
});
