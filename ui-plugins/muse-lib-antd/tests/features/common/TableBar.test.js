import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableBar } from '../../../src/features/common';

describe('common/TableBar', () => {
  it('renders TableBar', async () => {
    console.log = jest.fn();
    render(<TableBar 
      onSearch={(v) => { 
        console.log(v)
      }} 
      placeholder={"Search something"}>
        <span>Component to search on</span>
      </TableBar>);
    
    expect(screen.getByPlaceholderText('Search something')).toBeTruthy();
    expect(screen.getByText('Component to search on')).toBeTruthy();
    const textbox = screen.getByRole('textbox');
    userEvent.clear(textbox);
    userEvent.type(textbox, 'hello');
    await waitFor(() => expect(console.log).toHaveBeenCalledWith('hello'), { timeout: 5000});
  });
});
