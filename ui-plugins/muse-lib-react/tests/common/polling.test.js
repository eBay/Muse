import { polling } from '../../src/features/common';
import { act, waitFor } from '@testing-library/react';

describe('polling tests', () => {
    it('default test', async () => {

        let stopIt = false;
        let counter = 0;

        const poller = polling({
            interval: 1000,
            stopIf: () => stopIt,
            task: async () => counter++,
          });
        
        await waitFor(
        () =>
            expect(counter).toBeGreaterThan(0),
        {
            timeout: 5000,
        },
        );

        act(() => {
            poller.stop();
            counter = 0;
        });
        
        poller.restart();

        await waitFor(
        () =>
            expect(counter).toBeGreaterThan(0),
        {
            timeout: 5000,
        },
        );

        act(() => {
            poller.stop();
            counter = 0;
        });
    });

    it('stopIf test', async () => {

        let stopIt = false;
        let counter = 0;

        const poller = polling({
            interval: 1000,
            stopIf: () => stopIt,
            task: async () => counter++,
          });
        
        await waitFor(
        () =>
            expect(counter).toBeGreaterThan(0),
        {
            timeout: 5000,
        },
        );

        stopIt = true;

        await waitFor(
        () =>
            expect(poller.stopped).toBeTruthy(),
        {
            timeout: 5000,
        },
        );

        act(() => {
            poller.stop();
            counter = 0;
        });
    });

    it('catch/retry', async () => {

        let counter = 0;

        const poller = polling({
            interval: 500,
            retries: 3,
            task: async () => { throw new Error("poller task error") },
          });
        
        await waitFor(
        () =>
            expect(poller.remaining).toBe(0),
        {
            timeout: 5000,
        },
        );

        act(() => {
            poller.stop();
            counter = 0;
        });
    });
});
