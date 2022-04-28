import React, { Component } from 'react';
import { ErrorBox } from './';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentWillReceiveProps() {
    this.setState({ hasError: false });
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true, error, info });
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
    console.error(error, info);
  }

  renderDefaultError() {
    return (
      <ErrorBox
        showStack
        error={this.state.error}
        title="Something went wrong"
        preDescription={
          <span>
            The current page is not able to render. Please refresh to retry or{' '}
            <a
              href="https://jirap.corp.ebay.com/projects/ALTUSADMIN"
              target="_blank"
              rel="noopener noreferrer"
            >
              contact Altus support
            </a>
            .
            <br />
            --------
            <br />
          </span>
        }
      />
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="muse-antd_common-error-boundary">
          {this.props.message || this.renderDefaultError()}
        </div>
      );
    }
    return this.props.children; // eslint-disable-line
  }
}
