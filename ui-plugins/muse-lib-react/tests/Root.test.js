import React from 'react';
import { render, screen } from '@testing-library/react';
import Root from '../src/Root';

describe('Root', () => {
  it('Root has no error', () => {
    render(<Root />);
    // check that default homepage is rendered
    expect(screen.getByText('Welcome to Muse!')).toBeTruthy();
  });
});
