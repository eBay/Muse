import React from 'react';
import { act, waitFor, screen } from '@testing-library/react';

describe('index', () => {
  it('index.js has no error', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    window.MUSE_GLOBAL.appEntries = [];
    require('../src/index');
    
    act(() => {
      window.MUSE_GLOBAL.appEntries[0].func();
    });

    await waitFor(
      () =>
        expect(screen.getByText('Welcome to Muse!')).toBeTruthy(),
      {
        timeout: 5000,
      },
    );
  });
});
