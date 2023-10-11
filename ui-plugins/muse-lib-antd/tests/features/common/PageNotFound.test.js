import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageNotFound } from '../../../src/features/common';

describe('common/PageNotFound', () => {
  it('renders PageNotFound', () => {
    render(<PageNotFound />);
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back Home' })).toBeTruthy();
  });
});