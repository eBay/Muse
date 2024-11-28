import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingMask } from '../../../src/features/common';

describe('common/LoadingMask', () => {
  it('renders default LoadingMask', () => {
    const { container } = render(<LoadingMask />);
    expect(container.querySelector('.muse-antd_common-loading-mask')).toBeTruthy();
  });
});