import { screen, waitFor } from '@testing-library/react';
import registerSw from '../src/registerSw';

describe('registerSw', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  let logSpy = null;
  const { location } = window;
  const mg = {
    serviceWorker: jest.fn(),
  };
  Object.defineProperty(window, 'MUSE_GLOBAL', { value: mg, writable: true });
  Object.defineProperty(global.navigator, 'serviceWorker', {
    value: {
      register: jest.fn(),
    },
  });

  beforeAll(() => {
    jest.useFakeTimers();
    delete window.location;
    window.location = { protocol: 'https:' };
    logSpy = jest.spyOn(global.console, 'log');
  });

  afterAll(() => {
    window.location = location;
    logSpy.mockRestore();
  });

  it('should register service worker successfully', async () => {
    global.navigator.serviceWorker.register = () => {
      return new Promise((resolve) => {
        resolve();
      });
    };
    registerSw();
    await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Service Worker register done.'));
  });

  it('fails to register service worker with timeout', async () => {
    global.navigator.serviceWorker.register = async () => {
      await delay(20000);
      return new Promise((resolve) => {
        resolve();
      });
    };
    registerSw();
    jest.runAllTimers();
    await waitFor(() =>
      expect(logSpy).toHaveBeenCalledWith(
        'Failed to register service worker in 10 seconds. Skip it.',
      ),
    );
  });

  it('fails to register service worker with exception', async () => {
    global.navigator.serviceWorker.register = async () => {
      throw new Error(`Service Worker Exception`);
    };
    registerSw();
    await waitFor(() =>
      expect(logSpy).toHaveBeenCalledWith('Failed to register service worker, skip it.'),
    );
  });
});
