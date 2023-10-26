import { screen, waitFor } from '@testing-library/react';
import { createHash } from 'crypto';

describe('start', () => {
  const { location } = window;
  const appConfig = { theme: 'dark', entry: 'muse-boot-default' };
  const envConfig = { name: 'test' };
  const mg = {
    app: { config: appConfig, variables: { 'primary-color': '#000000' } },
    env: { config: envConfig, variables: { 'primary-color': '#000001' } },
    appEntries: [{ name: 'muse-boot-default', func: jest.fn() }],
    pluginEntries: [{ func: jest.fn() }],
    initEntries: [
      {
        name: 'init-test',
        func: () => {
          return new Promise((resolve) => {
            resolve();
          });
        },
      },
    ],
    serviceWorker: jest.fn(),
    museClientCode: createHash('md5').update('127.0.0.1').digest('hex'),
    plugins: [
      { name: 'muse-boot-default', type: 'boot', version: '1.0.0', jest: true },
      { name: 'init-test', type: 'init', version: '1.0.0', jest: true },
    ],
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

  it('should execute the boot logic successfully', async () => {
    await require('../src/index.js');

    expect(document.body.classList.contains('muse-theme-dark')).toBe(true);

    await waitFor(() =>
      expect(screen.queryByRole('img', { name: 'logo' })).not.toBeInTheDocument(),
    );

    // merged config between app and env
    expect(mg.appConfig).toEqual({ entry: 'muse-boot-default', name: 'test', theme: 'dark' });

    // merged app variables between app and ebv
    expect(mg.getAppVariables()).toEqual({ 'primary-color': '#000001' });
  });
});
