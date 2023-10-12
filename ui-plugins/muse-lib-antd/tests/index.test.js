import React from 'react';
import { act, waitFor, screen } from '@testing-library/react';

describe('index', () => {
  it('index.js has no error', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    window.MUSE_GLOBAL.appEntries = [];
    require('../src/index');
  });
});
