import React from 'react';
import { render, screen } from '@testing-library/react';
import { RequestStatus } from '../../../src/features/common';

describe('common/RequestStatus', () => {
  it('renders RequestStatus with GlobalErrorBox', () => {
    render(<RequestStatus 
      errorMode="modal" 
      loadingMode="global" 
      dismissError={() => {}} 
      error={{ errorList: [{ error: 'Error1', message: 'Message1' }] }}
      />);
      expect(screen.getByText(/Error1.*:.*Message1/)).toBeTruthy();
  });
  it('renders RequestStatus throws error', () => {
    render(<RequestStatus 
      errorMode="modal" 
      />);
      expect(screen.getByText(/Error mode 'modal' must be used with 'dismissError'/)).toBeTruthy();
  });

  it('renders RequestStatus with ErrorBox', () => {
    render(<RequestStatus 
      errorMode="inline" 
      dismissError={() => {}} 
      error={{ errorList: [{ error: 'Error1', message: 'Message1' }] }}
      />);
      expect(screen.getByText(/Error1.*:.*Message1/)).toBeTruthy();
  });

  it('renders RequestStatus with GlobalLoading', () => {
    const { container } = render(<RequestStatus 
      loadingMode="global" 
      loading={true}
      />);
      expect(container.querySelector('.muse-antd_common-global-loading')).toBeTruthy();
  });

  it('renders RequestStatus with LoadingMask', () => {
    const { container } = render(<RequestStatus 
      loadingMode="container" 
      loading={true}
      />);
      expect(container.querySelector('.muse-antd_common-loading-mask')).toBeTruthy();
  });

  it('renders RequestStatus with Skeleton', () => {
    const { container } = render(<RequestStatus 
      loadingMode="skeleton" 
      loading={true}
      />);
      expect(container.querySelector('.ant-skeleton')).toBeTruthy();
  });
});
