import React from 'react';
import { render, screen } from '@testing-library/react';
import { BlockView } from '../../../src/features/common';

describe('common/BlockView', () => {
  it('renders BlockView with emails', () => {
    render(<BlockView value={['Olive', 'Allen', 'Gerry', 'Cindy', 'Ezra']} openEmail={true} />);
    expect(screen.getByRole('link', { name: 'Olive' }).getAttribute('href')).toBe('mailto:Olive@ebay.com')
    expect(screen.getByRole('link', { name: 'Ezra' }).getAttribute('href')).toBe('mailto:Ezra@ebay.com')
  });

  it('renders BlockView without emails', () => {
    render(<BlockView value={['Olive', 'Allen', 'Gerry', 'Cindy', 'Ezra']} openEmail={false} />);
    expect(screen.queryAllByRole('link')).toEqual([]);
    expect(screen.getByText('Olive')).toBeTruthy();
    expect(screen.getByText('Ezra')).toBeTruthy();
  });

  it('renders BlockView with non-string values', () => {
    render(<BlockView value={[{ id: 1 }]} openEmail={false} />);
    expect(screen.queryAllByRole('link')).toEqual([]);
    expect(screen.getByText('[object]')).toBeTruthy();    
  });

  it('renders BlockView with non-array value', () => {
    render(<BlockView value={'Olive'} openEmail={false} />);
    expect(screen.queryAllByRole('link')).toEqual([]);
    expect(screen.getByText('Olive')).toBeTruthy();    
  });
});
