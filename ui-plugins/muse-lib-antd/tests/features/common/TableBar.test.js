import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableBar } from '../../../src/features/common';

describe('common/TableBar', () => {
  it('renders TableBar', () => {
    render(<TableBar onSearch={() => {}} placeholder={"Search something"}>Component to search on</TableBar>);
    
  });
});
