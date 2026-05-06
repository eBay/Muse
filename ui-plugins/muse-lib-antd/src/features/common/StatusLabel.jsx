import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from './';

export default function StatusLabel(props) {
  const { type, label } = props;
  const newProps = { ...props };
  delete newProps.type;
  delete newProps.label;
  return (
    <div
      className={`muse-antd_common-status-label status-${type.toLowerCase()}`}
      title={label}
      {...newProps}
    >
      {label} {type === 'PROCESSING' && <Icon type="loading" />}
    </div>
  );
}

StatusLabel.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['SUCCESS', 'FAILURE', 'PROCESSING', 'Retired', 'INFO', 'DORMANT']),
};
StatusLabel.defaultProps = {};
