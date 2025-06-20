import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

export default class BlockView extends Component {
  static propTypes = {
    value: PropTypes.any,
    openEmail: PropTypes.bool,
  };

  static defaultProps = {
    value: '',
    openEmail: false,
  };

  renderUser = uid => {
    if (typeof uid !== 'string') return '[object]';
    const { openEmail } = this.props;
    return (
      <span key={uid}>
        {openEmail ? (
          <a href={`mailto:${uid}@ebay.com`} target="_blank" rel="noopener noreferrer">
            {uid}
          </a>
        ) : (
          uid
        )}
      </span>
    );
  };

  render() {
    let value = this.props.value || [];
    if (!_.isArray(value)) value = [value];

    return <div className="muse-antd_common-block-view">{value.map(this.renderUser)}</div>;
  }
}
