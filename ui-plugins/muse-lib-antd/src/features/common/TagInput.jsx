import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

export default function TagInput(props) {
  return (
    <Select
      {...props}
      className="muse-antd_common-tag-input"
      mode="tags"
      style={{ width: '100%' }}
      popupClassName="force-hidden"
      tokenSeparators={[' ']}
      maxTagCount={props.max}
    />
  );
}

TagInput.propTypes = {
  max: PropTypes.number,
  value: PropTypes.any,
  onChange: PropTypes.func,
};
TagInput.defaultProps = {
  max: 5000,
  onChange: () => {},
};
