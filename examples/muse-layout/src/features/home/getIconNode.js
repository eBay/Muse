import React from 'react';
import Icon, * as icons from '@ant-design/icons';

export default item => {
  if (item.props && item.props.icon) return item.props.icon;
  const icon = item.icon;
  if (!icon) return null;

  if (typeof icon === 'string') {
    const IconComp = icons[icon];
    if (!IconComp) return null;
    return <IconComp {...item.iconProps} />;
  }
  if (React.isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === 'function' || typeof icon === 'object') {
    return <Icon component={icon} {...item.iconProps} />;
  }
  return null;
};
