import React from 'react';
import _ from 'lodash';
import Icon, * as icons from '@ant-design/icons';

const pascalCase = _.flow(
  _.camelCase,
  _.upperFirst,
);
export default item => {
  if (item.props && item.props.icon) return item.props.icon;
  const icon = item.icon;
  if (!icon) return null;
  

  if (typeof icon === 'string') {
    const mapped = /^[A-Z]/.test(icon) ? icon : pascalCase(icon + '-outlined');

    const IconComp = icons[mapped];
    if (!IconComp) return null;
    return <IconComp />;
  }
  if (React.isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === 'function' || typeof icon === 'object') {
    return <Icon component={icon} {...item.iconProps} />;
  }
  return null;
};
