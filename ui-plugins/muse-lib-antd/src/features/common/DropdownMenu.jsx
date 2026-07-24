import React from 'react';
import { Dropdown, Button, Tooltip, Popconfirm } from 'antd';
import _ from 'lodash';
import plugin from 'js-plugin';
import history from '../../common/history';
import getIconNode from './getIconNode';

const renderOuterItem = ({ key, icon, label, disabled, confirm, disabledText, buttonProps, highlight: _highlight, size: _size, ...rest }, size) => {
  // buttonProps is the recommended way to pass extra props to Button.
  // rest is kept for backward compatibility but may cause React DOM warnings
  // if it contains non-HTML attributes (e.g. js-plugin metadata fields).
  const extraProps = buttonProps ?? rest;
  const iconNode = icon ? getIconNode({ icon }) : getIconNode({ icon: 'file' });

  let ele = (
    <Tooltip title={disabled ? disabledText || label : label} key={key}>
      <Button size={size} disabled={disabled} style={{ borderColor: '#d9d9d9' }} icon={iconNode} {...extraProps} />
    </Tooltip>
  );

  if (confirm) {
    ele = <Popconfirm {...confirm}>{ele}</Popconfirm>;
  }

  return ele;
};

export default function DropdownMenu({
  labelNode = '',
  size = 'small',
  items = [],
  extPoint = null,
  menuProps = {},
  nodeProps = {},
  render = null,
  extPointParams = [],
  triggerNode,
  type,
}) {
  if (extPoint) {
    plugin.invoke(extPoint, items, ...(extPointParams || []));
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
