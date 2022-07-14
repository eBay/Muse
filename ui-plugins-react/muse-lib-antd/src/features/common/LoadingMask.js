
import React, { Component } from 'react';
import { Spin } from 'antd';



export default class LoadingMask extends Component {
  static propTypes = {};

  render() {
    return (
      <div className="muse-antd_common-loading-mask">
        <Spin size="large" />
      </div>
    );
  }
}
