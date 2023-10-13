import React from 'react';
import { render, screen } from '@testing-library/react';
import { TagInput } from '../../../src/features/common';

describe('common/TagInput', () => {
  it('renders TagInput', () => {
    render(<TagInput max="4"/>);
    const textbox = screen.getByRole('combobox');
    expect(textbox).toBeTruthy();
  });
});