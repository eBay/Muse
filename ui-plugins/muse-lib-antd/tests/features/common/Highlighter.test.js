import React from 'react';
import { render, screen } from '@testing-library/react';
import { Highlighter } from '../../../src/features/common';

describe('common/Highlighter', () => {
  it('renders default Highlighter', () => {
    const { container } = render(<Highlighter search={["and", "or", "the"]} text="The dog is chasing the cat. Or perhaps they're just playing?" />);
    expect(container.querySelectorAll('.muse-antd_common-highlighter-span')).toHaveLength(4);
  });
});
