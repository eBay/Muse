import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageNotFound } from '../../../src/features/common';
import history from '../../../src/common/history';

describe('common/PageNotFound', () => {
  it('renders PageNotFound', async () => {
    render(<PageNotFound />);
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back Home' })).toBeTruthy();
    userEvent.click(screen.getByRole('button', { name: 'Back Home' }));
    await waitFor(() => expect(history.location.pathname).toBe('/'), { timeout : 3000 });
  });
});