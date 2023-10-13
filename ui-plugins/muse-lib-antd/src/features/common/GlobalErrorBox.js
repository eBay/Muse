import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { ErrorBox } from './';

export default class GlobalErrorBox extends Component {
  static propTypes = {
    title: PropTypes.string,
    error: PropTypes.object.isRequired,
    onOk: PropTypes.func,
    okText: PropTypes.string,
    onClose: PropTypes.object,
  };

  static defaultProps = {
    title: 'Error',
    onOk() {},
    okText: 'Close',
    onClose: null
  };


  render() {
    const { title, onOk, okText, error, onClose } = this.props;
    return (
      <Modal
        open={true}
        width="600px"
        footer={null}
        className="muse-antd_common-global-error-box"
        btnSize={null}
        closeable={false}
        onCancel={onClose}
      >
        <ErrorBox title={title} onRetry={onOk} retryText={okText} error={error} style={{marginTop:'-12px' }}/>
      </Modal>
    );
  }
}
