import React, { Component } from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../../src/features/common';

describe('common/ErrorBoundary', () => {
  it('renders children if no error', () => {
    render(<ErrorBoundary>No errors</ErrorBoundary>);
    // check that "No errors" is rendered
    expect(screen.getByText('No errors')).toBeTruthy();
  });
  it('renders default error message', () => {
    class GFGComponent extends Component {
      // GFGComponent throws error as state of GFGCompnonent is not defined
      render() {
        return <h1>{this.state.heading}</h1>;
      }
    }
    render(<ErrorBoundary><GFGComponent /></ErrorBoundary>);
    // check that "No errors" is rendered
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('renders custom error message', () => {
    class GFGComponent extends Component {
      // GFGComponent throws error as state of GFGCompnonent is not defined
      render() {
        return <h1>{this.state.heading}</h1>;
      }
    }
    render(<ErrorBoundary message="Custom Message"><GFGComponent /></ErrorBoundary>);
    // check that "No errors" is rendered
    expect(screen.getByText('Custom Message')).toBeTruthy();
  });
});
