import { screen, waitFor } from '@testing-library/react';
import { createHash } from 'crypto';

describe('muse-boot-default', () => {
  let logSpy = null;
  const { location } = window;
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
    logSpy = jest.spyOn(global.console, 'log');
  });

  afterAll(() => {
    window.location = location;
    logSpy.mockRestore();
  });

  it('should execute the boot logic successfully', async () => {
    const appConfig = { theme: 'dark', entry: 'muse-boot-default', supportLink: 'https://go/muse' };
    const envConfig = { name: 'test' };
    const mg = {
      cdn: 'https://dummy.cdn.ebay.com',
      app: {
        config: appConfig,
        variables: { 'primary-color': '#000000' },
        pluginVariables: { 'demo-test': { 'demo-var-1': true } },
      },
      env: {
        config: envConfig,
        variables: { 'primary-color': '#000001' },
        pluginVariables: { 'demo-test': { 'demo-var-2': true } },
      },
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
        { name: 'demo-test', type: 'normal', version: '1.0.0', jest: true },
        { name: 'demo-lib-test', type: 'lib', version: '1.0.0', jest: true },
        {
          name: 'linked-test',
          type: 'normal',
          version: '1.0.0',
          linkedTo: 'another-test-module',
          jest: true,
        },
        {
          name: 'local-test',
          type: 'normal',
          version: '1.0.0',
          isLocalLib: true,
          url: 'http://somewhere.ebay.com:3000',
          jest: true,
        },
      ],
      waitForLoaders: [jest.fn()],
    };
    Object.defineProperty(window, 'MUSE_GLOBAL', { value: mg });

    require('../src/index.js');

    expect(document.body.classList.contains('muse-theme-dark')).toBe(true);

    await waitFor(() =>
      expect(screen.queryByRole('img', { name: 'logo' })).not.toBeInTheDocument(),
    );

    // merged config between app and env
    expect(mg.appConfig).toEqual({
      entry: 'muse-boot-default',
      name: 'test',
      supportLink: 'https://go/muse',
      theme: 'dark',
    });

    // merged app variables between app and ebv
    expect(mg.getAppVariables()).toEqual({ 'primary-color': '#000001' });
    expect(mg.getPluginVariables('demo-test')).toEqual({ 'demo-var-1': true, 'demo-var-2': true });

    expect(mg.getPublicPath('demo-lib-test', 'dummy.css')).toBe(
      'https://dummy.cdn.ebay.com/p/demo-lib-test/1.0.0/dist/dummy.css',
    );
    expect(logSpy).toHaveBeenCalledWith('Loading Muse app by muse-boot-default@1.0.0...');
    expect(logSpy).toHaveBeenCalledWith('Plugins(6):');
    expect(logSpy).toHaveBeenCalledWith('  * muse-boot-default@1.0.0');
    expect(logSpy).toHaveBeenCalledWith('  * init-test@1.0.0');
    expect(logSpy).toHaveBeenCalledWith('  * demo-test@1.0.0');
    expect(logSpy).toHaveBeenCalledWith('  * demo-lib-test@1.0.0');
    expect(logSpy).toHaveBeenCalledWith('  * linked-test@1.0.0 (Linked to: another-test-module)');
    expect(logSpy).toHaveBeenCalledWith('  * local-test@1.0.0 (Local:3000)');
    expect(logSpy).toHaveBeenCalledWith('Service Worker register done.');
    expect(logSpy).toHaveBeenCalledWith('Starting the app from muse-boot-default...');

    expect(document.head.innerHTML).toEqual(
      '<script src="https://dummy.cdn.ebay.com/p/init-test/v1.0.0/dist/main.js"></script><script src="https://dummy.cdn.ebay.com/p/demo-test/v1.0.0/dist/main.js"></script><script src="https://dummy.cdn.ebay.com/p/demo-lib-test/v1.0.0/dist/main.js"></script>',
    );
  });

  it('isDev variations', async () => {});
});
