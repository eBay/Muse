import React, { Component } from 'react';

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
      <div>Something went wrong.</div>
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="common-error-boundary">
          {this.props.message || this.renderDefaultError()}
        </div>
      );
    }
    return this.props.children; // eslint-disable-line
  }
}
