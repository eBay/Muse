import React from 'react';
import { render, screen } from '@testing-library/react';
import { GlobalErrorBox } from '../../../src/features/common';

describe('common/GlobalErrorBox', () => {
  it('renders default GlobalErrorBox', () => {
    render(<GlobalErrorBox
      title="Custom Title"
      error={{ errorList: [{ error: 'Error1', message: 'Message1' }] }}
      onOk={()=> {}}
      okText="custom ok text"
      onClose={()=> {}}
    />);
    expect(screen.getByText('Custom Title')).toBeTruthy();
    expect(screen.getByRole('button', { name: /custom ok text/})).toBeTruthy();
    expect(screen.getByText(/Error1.*:.*Message1/)).toBeTruthy();
  });
});