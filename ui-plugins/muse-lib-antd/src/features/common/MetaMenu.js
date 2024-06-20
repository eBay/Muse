import React from 'react';
import { Menu, Dropdown } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Link, useLocation } from 'react-router-dom';
import plugin from 'js-plugin';
import getIconNode from './getIconNode';

/*
  Meta driven menu based on Antd's Menu component.
  Supported features:
  - Menu Item
  - Menu Group
  - Sub Menu
  - Arbitrary content
  - Multiple modes
  - Dropdown menu support
  - Collapsable
*/
export default function MetaMenu({ meta = {}, onClick, baseExtPoint, autoSort = true }) {
  const autoKeySeed = React.useRef({ seed: 0 });
  // Get items from ext points
  const extItems = baseExtPoint ? _.flatten(plugin.invoke(baseExtPoint + '.getItems', meta)) : null;
  const itemByKey = {};

  const rawItems = [...(meta.items || []), ...(extItems || [])];
  const itemsByParent = _.groupBy(
    rawItems.filter(item => !!item.parent),
    'parent',
  );
  let newItems = rawItems.filter(item => !item.parent).map(item => ({ ...item })); // do not modify the raw meta;

  // For items that have parent prop, move them to correct children
  const arr = [...newItems];
  while (arr.length > 0) {
    const item = arr.shift();
    if (!item.key) {
      item.key = `auto_key_${autoKeySeed.seed}`;
      autoKeySeed.seed++;
    }
    itemByKey[item.key] = item;
    const childItems = itemsByParent[item.key];
    if (childItems) {
      if (!item.children) item.children = [];
      else item.children = [...item.children]; // do not modify the raw meta
      item.children.push(...childItems.map(item => _.omit(item, 'parent')));
    }
    if (item.children) {
      arr.push(...item.children);
      if (autoSort) plugin.sort(item.children);
    }
  }

  // Allow to process items after all items get normalized
  if (baseExtPoint) {
    if (autoSort) plugin.sort(newItems);
    plugin.invoke(baseExtPoint + '.processItems', meta, newItems, itemByKey);
  }

  // remove divider and group items if collapsed
  const newItems2 = [];
  if (meta.collapsed) {
    newItems.forEach(item => {
      if (item.type === 'group') {
        newItems2.push({
          key: item.key,
          type: 'divider',
        });
        newItems2.push(...item.children);
      } else {
        newItems2.push(item);
      }
    });
    newItems = newItems2;
  }

  const metaOnClick = meta.onClick;
  const handleMenuClick = args => {
    const item = itemByKey[args.key];
    item && item.onClick && item.onClick(args);
    metaOnClick && metaOnClick(args);
    onClick && onClick(args);
  };

  const activeKeys = meta.activeKeys || [];
  const loc = useLocation();

  Object.values(itemByKey).forEach(item => {
    let labelContent = item.label;
    if (item.link) {
      if (
        item.link.startsWith('http:') ||
        item.link.startsWith('https:') ||
        item.link.startsWith('mailto:')
      ) {
        labelContent = (
          <a href={item.link} target={item.linkTarget || '_self'}>
            {item.label}
          </a>
        );
      } else {
        labelContent = <Link to={item.link}>{item.label}</Link>;
      }
    }
    item.label = labelContent;

    item.icon = getIconNode(item);

    // Show active menu items
    if (!meta.activeKeys && meta.autoActive) {
      if (typeof item.activeMatch === 'object' && item.activeMatch.test) {
        if (item.activeMatch.test(loc.pathname)) {
          activeKeys.push(item.key);
        }
      } else if (typeof item.activeMatch === 'function') {
        if (item.activeMatch(loc)) {
          activeKeys.push(item.key);
        }
      } else if (!item.activeMatch && item.link === loc.pathname) {
        activeKeys.push(item.key);
      }
    }
  });

  if (newItems.length === 0) return null;
  const menuClassnames = ['muse-antd_common-meta-menu'];
  if (meta.menuClassName) {
    menuClassnames.push(meta.menuClassName);
  }

  const menuMode = meta.dropdown ? null : meta.collapsed ? 'inline' : meta.mode;
  const menuProps = {
    mode: menuMode,
    selectedKeys: activeKeys || [],
    onClick: handleMenuClick,
    ...meta.menuProps,
    className: menuClassnames.join(' '),
    theme: meta.theme || 'light',
    items: newItems,
  };

  if (menuMode === 'inline' && !meta.hasOwnProperty('collapsed'))
    menuProps.inlineCollapsed = !!meta.collapsed;

  if (meta.trigger) {
    const { trigger } = meta;
    const triggerClassNames = ['muse-antd_common-meta-menu-trigger'];
    if (trigger.className) {
      triggerClassNames.push(trigger.className);
    }
    const triggerIcon = getIconNode(trigger) || null;
    const ele = (
      <div className={triggerClassNames.join(' ')}>
        <span>
          {triggerIcon}
          {trigger.label && <span className="trigger-label">{trigger.label}</span>}
          {!trigger.noCaret && <CaretDownOutlined />}
        </span>
      </div>
    );
    return <Dropdown menu={menuProps}>{ele}</Dropdown>;
  }

  return <Menu {...menuProps} inlineCollapsed={meta.collapsed} />;
}
