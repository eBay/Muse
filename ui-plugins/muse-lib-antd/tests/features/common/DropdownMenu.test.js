import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from '../../../src/features/common';

describe('common/DropdownMenu', () => {

  const items = [
    {
      key: 'build',
      label: 'Trigger a build',
      disabled: false,
      icon: 'ToolOutlined',
      order: 20,
      highlight: true,
      onClick: () => {},
    },
    {
      key: 'gitRepo',
      label: `Open Git repo`,
      icon: 'GithubOutlined',
      order: 50,
      highlight: false,
      onClick: () => {},
    },
  ];

  it('renders DropdownMenu with items', async () => {
    render(<DropdownMenu items={items} />);
    expect(screen.getByRole('img', { name: /tool/})).toBeTruthy();
    expect(screen.getByRole('img', { name: /ellipsis/})).toBeTruthy();

    const trigger = screen.getByRole('button', { name: /ellipsis/});
    await userEvent.hover(trigger);

    await waitFor(
      () =>
      expect(screen.getByText('Open Git repo')).toBeTruthy(),
      {
        timeout: 5000,
      }
    )
  });
});