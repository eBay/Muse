import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlockView } from '../../../src/features/common';

describe('common/BlockView', () => {
  it('renders BlockView', () => {
    render(<BlockView value={['Olive', 'Allen', 'Gerry', 'Cindy', 'Ezra']} openEmail={true} />);
    expect(screen.getByText('Olive')).toBeTruthy();
    expect(screen.getByText('Ezra')).toBeTruthy();
  });
});
