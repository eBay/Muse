import React from 'react';
import Icon from '@ant-design/icons';

const DynamicThemeIconSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" version="1.1">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g fill="#212121" fill-rule="nonzero">
        <path d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,20.5 L12,3.5 C16.6944204,3.5 20.5,7.30557963 20.5,12 C20.5,16.6944204 16.6944204,20.5 12,20.5 Z"></path>
      </g>
    </g>
  </svg>
);

export default function DynamicThemeIcon(props) {
  return <Icon component={DynamicThemeIconSvg} aria-label="theme-icon" {...props} />;
}

DynamicThemeIcon.propTypes = {};
DynamicThemeIcon.defaultProps = {};
