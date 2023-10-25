import loading from '../src/loading';
import { screen, waitFor } from '@testing-library/react';

describe('start', () => {
  const { location } = window;

  const appConfig = { entry: 'muse-boot-default' };
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

  beforeEach(() => {
    jest.spyOn(loading, 'showMessage').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    window.location = location;
  });

  it('should set appConfig on MUSE_GLOBAL', async () => {
    await require('../src/index.js');
    expect(mg.appConfig).toEqual({ entry: 'muse-boot-default', name: 'test' });
    expect(loading.showMessage).toHaveBeenCalledWith('Starting...');
    await waitFor(() => expect(screen.queryByText('Starting...')).not.toBeInTheDocument());
  });
});
