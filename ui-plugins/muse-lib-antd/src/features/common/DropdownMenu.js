import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Button, Tooltip } from 'antd';
import _ from 'lodash';
import plugin from 'js-plugin';
import history from '../../common/history';
import getIconNode from './getIconNode.js';

const renderOuterItem = ({ icon, label, disabled, disabledText, ...rest }, size) => {
  delete rest.highlight;
  delete rest.size;
  const iconNode = icon ? getIconNode({ icon }) : getIconNode({ icon: 'file' });
  rest.icon = iconNode;

  return (
    <Tooltip title={disabled ? disabledText || label : label} key={rest.key}>
      <Button size={size} disabled={disabled} {...rest} />
    </Tooltip>
  );
};

export default function DropdownMenu({
  items,
  triggerNode,
  extPoint,
  extPointParams,
  nodeProps,
  menuProps,
  type,
  size,
}) {
  if (extPoint) {
    plugin.invoke(extPoint, items, ...extPointParams);
    plugin.sort(items);
  }

  items.forEach(item => {
    if (item.link && item.onClick)
      throw new Error('Only one of link and onClick can be defined in dropdown menu item.');
    if (item.link) {
      item.onClick = () => history.push(item.link);
    }
  });

  const outerItems = items.filter(item => item.highlight);
  const menuItems = items
    .filter(item => !item.highlight)
    .map(({ key, label, icon, disabled = false, onClick, menuItemProps = {} }, index) => {
      return _.omitBy(
        {
          key,
          label,
          onClick,
          icon: getIconNode({ icon }),
          disabled,
          ...menuItemProps,
        },
        v => v === undefined || v === null,
      );
    });

  const outer = (
    <>{outerItems.map(item => (item.render ? item.render() : renderOuterItem(item, size)))}</>
  );

  return (
    <span className="muse-antd_common-dropdown-menu">
      {outer}
      {!!menuItems?.length && (
        <Dropdown menu={{ items: menuItems }}>
          {triggerNode || <Button size={size} icon={getIconNode({ icon: 'ellipsis' })} />}
        </Dropdown>
      )}
    </span>
  );
}

DropdownMenu.defaultProps = {
  labelNode: '',
  size: 'small',
  items: [],
  extPoint: null,
  menuProps: {},
  nodeProps: {},
  render: null,
  extPointParams: [],
};
