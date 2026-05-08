import React, { Component } from 'react';
import { ErrorBox } from './';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  renderDefaultError() {
    return (
      <ErrorBox
        showStack
        error={this.state.error}
        title="Something went wrong"
        preDescription={
          <div>
            The current page is not able to render. Please refresh to retry or contact the app
            owner.
            <p>--------</p>
          </div>
        }
      />
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="muse-lib-antd_common-error-boundary">
          {this.props.message || this.renderDefaultError()}
        </div>
      );
    }
    return this.props.children; // eslint-disable-line
  }
}
