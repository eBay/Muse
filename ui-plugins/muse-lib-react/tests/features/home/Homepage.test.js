import React from 'react';
import { render, screen } from '@testing-library/react';
import { Homepage } from '../../../src/features/home';

describe('home/Homepage', () => {
  it('renders Homepage', () => {
    render(<Homepage />);
    // check that default homepage is rendered
    expect(screen.getByText('Welcome to Muse!')).toBeTruthy();
  });
});
