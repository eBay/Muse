import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Alert, Button } from 'antd';

export default class ErrorBox extends Component {
  // static propTypes = {
  //   title: PropTypes.node,
  //   content: PropTypes.node,
  //   description: PropTypes.any,
  //   preDescription: PropTypes.any,
  //   onRetry: PropTypes.func,
  //   retryText: PropTypes.string,
  //   error: PropTypes.object,
  //   btnSize: PropTypes.string,
  //   showStack: PropTypes.bool,
  // };

  static defaultProps = {
    title: 'Request Failed',
    content: 'The request was failed, please check the network and retry.',
    onRetry: null,
    error: null,
    description: null,
    btnSize: 'small',
    showStack: false,
  };

  renderDescription() {
    const { content, onRetry, retryText, btnSize } = this.props;
    let { error } = this.props;
    let errorInfo = null;
    let errorList = _.get(error, 'errorList') || _.get(error, 'response.data.error.errorList');

    if (error.config && error.request && error.response && error.response.data) {
      // This is a axios error with response
      error = error.response.data;
    }

    if (errorList && errorList.length) {
      errorInfo = errorList.map(err => (
        <div key={err.error}>
          {err.error}: {err.message}
        </div>
      ));
    } else if (error) {
      errorInfo =
        error.message ||
        error.stack ||
        error.exceptionMessage ||
        error.exceptionTrace ||
        (error === Object(error) ? JSON.stringify(error) : error);
    }
    return (
      <div>
        {this.props.preDescription && <div>{this.props.preDescription}</div>}
        <div>{errorInfo || content}</div>
        {this.props.showStack && error.stack && (
          <div style={{ color: 'red' }}>
            {error.stack.split('\n').map(s => (
              <div>{s}</div>
            ))}
          </div>
        )}
        {this.props.description && <div>{this.props.description}</div>}
        {onRetry && (
          <Button type="primary" size={btnSize} onClick={onRetry}>
            {retryText || 'Retry'}
          </Button>
        )}
      </div>
    );
  }

  render() {
    const { dismissError } = this.props;
    return (
      <div className="muse-antd_common-error-box">
        <Alert
          showIcon
          type="error"
          message={this.props.title}
          description={this.renderDescription()}
          closable={!!dismissError}
          onClose={dismissError}
        />
      </div>
    );
  }
}
