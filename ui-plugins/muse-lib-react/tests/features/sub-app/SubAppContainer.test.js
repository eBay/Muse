import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubAppContainer from '../../../src/features/sub-app/SubAppContainer';

describe('sub-app/SubAppContainer', () => {
  const subApp = {
    url: 'https://example.com',
  };

  it('renders the component', () => {
    render(<SubAppContainer subApp={subApp} />);
    expect(screen.getByTestId('sub-app-container')).toBeInTheDocument();
  });

  it('navigates to the correct URL when the sub app changes', () => {
    render(<SubAppContainer subApp={subApp} />);
    const newSubApp = {
      url: 'https://example2.com',
    };
    userEvent.click(screen.getByTestId('sub-app-container'));
    expect(window.location.href).toEqual(`${newSubApp.url}/`);
  });
});