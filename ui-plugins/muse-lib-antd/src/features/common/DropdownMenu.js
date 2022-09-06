import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu, Button, Tooltip } from 'antd';
import _ from 'lodash';
import plugin from 'js-plugin';
import history from '../../common/history';
import getIconNode from './getIconNode.js';

const renderMenuItem = ({ key, label, icon, disabled = false, menuItemProps = {} }) => {
  const itemProps = _.omitBy(
    {
      key,
      disabled,
      ...menuItemProps,
    },
    v => v === undefined || v === null,
  );

  return (
    <Menu.Item {...itemProps}>
      {icon && getIconNode({ icon: icon })}
      {icon && <span>&nbsp;</span>}
      {label}
    </Menu.Item>
  );
};

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

  const handleMenuClick = item => {
    const { key } = item;
    const found = _.find(items, { key });
    if (!found) {
      console.warn('No item found for key ' + key + ' in dropdown menu.');
      return;
    }
    if (found.onClick) found.onClick(found);
  };

  const outerItems = items.filter(item => item.highlight);
  const menuItems = items.filter(item => !item.highlight);
  const outer = (
    <>{outerItems.map(item => (item.render ? item.render() : renderOuterItem(item, size)))}</>
  );
  const menu = menuItems.length ? (
    <Menu onClick={handleMenuClick} {...menuProps}>
      {menuItems.map(item => (item.render ? item.render() : renderMenuItem(item)))}
      {menuItems.length === 0 && <Menu.Item disabled>No items.</Menu.Item>}
    </Menu>
  ) : null;

  return (
    <span className="muse-antd_common-dropdown-menu">
      {outer}
      {menu && (
        <Dropdown overlay={menu}>
          {triggerNode || <Button size={size} icon={getIconNode({ icon: 'ellipsis' })} />}
        </Dropdown>
      )}
    </span>
  );
}

// DropdownMenu.propTypes = {
//   triggerNode: PropTypes.node,
//   menuProps: PropTypes.object,
//   nodeProps: PropTypes.object,
//   size: PropTypes.string,
//   items: PropTypes.arrayOf(
//     PropTypes.shape({
//       key: PropTypes.string,
//       label: PropTypes.string,
//       icon: PropTypes.any,
//       disabled: PropTypes.boolean,
//       highlight: PropTypes.boolean,
//       link: PropTypes.string,
//       onClick: PropTypes.func,
//       menuItemProps: PropTypes.object,
//     }),
//   ),
//   extPoint: PropTypes.string,
//   extPointParams: PropTypes.array,
//   render: PropTypes.func,
// };
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
