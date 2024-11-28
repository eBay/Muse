import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusLabel } from '../../../src/features/common';

describe('common/StatusLabel', () => {
  it('renders StatusLabel with SUCCESS', () => {
    const { container } = render(<StatusLabel type="SUCCESS" label="success"/>);
    expect(container.querySelector('.status-success')).toBeTruthy();
    expect(screen.getByText('success')).toBeTruthy();
  });

  it('renders StatusLabel with FAILURE', () => {
    const { container } = render(<StatusLabel type="FAILURE" label="failure"/>);
    expect(container.querySelector('.status-failure')).toBeTruthy();
    expect(screen.getByText('failure')).toBeTruthy();
  });

  it('renders StatusLabel with INFO', () => {
    const { container } = render(<StatusLabel type="INFO" label="info"/>);
    expect(container.querySelector('.status-info')).toBeTruthy();
    expect(screen.getByText('info')).toBeTruthy();
  });

  it('renders StatusLabel with DORMANT', () => {
    const { container } = render(<StatusLabel type="DORMANT" label="dormant"/>);
    expect(container.querySelector('.status-dormant')).toBeTruthy();
    expect(screen.getByText('dormant')).toBeTruthy();
  });

  it('renders StatusLabel with PROCESSING', () => {
    const { container } = render(<StatusLabel type="PROCESSING" label="processing"/>);
    expect(container.querySelector('.status-processing')).toBeTruthy();
    expect(screen.getByText('processing')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'loading' })).toBeTruthy();
  });
});
