import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBox } from '../../../src/features/common';

describe('common/ErrorBox', () => {
  it('renders default ErrorBox', () => {
    render(<ErrorBox
      title="Custom Title"
      content="custom content"
      description="custom description"
      btnSize="small"
      error={{ errorList: [{ error: 'Error1', message: 'Message1' }] }}
    />);
    expect(screen.getByText('Custom Title')).toBeTruthy();
    expect(screen.getByText('custom description')).toBeTruthy();
    expect(screen.getByText(/Error1.*:.*Message1/)).toBeTruthy();
  });

  it('renders ErrorBox with retry', () => {
    render(<ErrorBox
      title="Error Title"
      content={null}
      onRetry={()=> {}}
      retryText="custom retry text"
      btnSize="small"
      error={{ error: 'Error2', message: 'Message2' }}
    />);
    expect(screen.getByText('Error Title')).toBeTruthy();
    expect(screen.getByText('Message2')).toBeTruthy();
    expect(screen.getByRole('button', { name: /custom retry text/})).toBeTruthy();
  });
});