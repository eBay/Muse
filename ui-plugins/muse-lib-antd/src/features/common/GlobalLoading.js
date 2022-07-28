
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';






export default class GlobalLoading extends Component {
  static propTypes = {
    full: PropTypes.bool,
  };

  render() {
    const style = {};
    if (this.props.full) {
      style.left = 0;
      style.right = 0;
    }
    return (
      <div className="muse-antd_common-global-loading" style={{ style }}>
        <Spin size="large" />
      </div>
    );
  }
}

