import React from 'react';
import _ from 'lodash';
import AntdIcon, * as icons from '@ant-design/icons';

const pascalCase = _.flow(
  _.camelCase,
  _.upperFirst,
);

export default function Icon(props) {
  if (!props.type) return <AntdIcon {...props} />;
  const iconProps = _.omit(props, ['type']);
  const RealIcon = icons[pascalCase(`${props.type}-outlined`)];
  return <RealIcon {...iconProps} />;
}
