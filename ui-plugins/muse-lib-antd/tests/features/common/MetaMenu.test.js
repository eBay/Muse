import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetaMenu } from '../../../src/features/common';

describe('common/MetaMenu', () => {
  it('renders MetaMenu', () => {
    render(<MetaMenu />);
  });
});
