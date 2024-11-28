import React from 'react';
import { render, screen } from '@testing-library/react';
import { GlobalLoading } from '../../../src/features/common';

describe('common/GlobalLoading', () => {
  it('renders default GlobalLoading', () => {
    const { container } = render(<GlobalLoading full={true} />);
    expect(container.querySelector('.muse-antd_common-global-loading')).toBeTruthy();
  });
});