import React, { useCallback, useMemo } from 'react';
import { Menu, Dropdown } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-use';
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
  const extItems = baseExtPoint ? _.flatten(plugin.invoke(baseExtPoint + '.getItems', meta)) : null;

  const items = useMemo(() => {
    // Normalize items
    const rawItems = [...(meta.items || []), ...(extItems || [])];
    const newItems = [];
    while (rawItems.length > 0) {
      const item = rawItems.shift();
      if (item.children) {
        const children = [...item.children.map((c) => ({ ...c, parent: item.key }))];
        rawItems.unshift(...children);
        newItems.push(_.omit(item, 'children'));
      } else {
        newItems.push(item);
      }
    }
    return newItems;
  }, [meta.items, extItems]);

  if (baseExtPoint) {
    if (autoSort) plugin.sort(items);
    plugin.invoke(baseExtPoint + '.processItems', meta);
  }

  const childrenByKey = useMemo(() => {
    const res = _.groupBy(items, 'parent');
    Object.values(res).forEach((arr) => plugin.sort(arr));
    return res;
  }, [items]);

  const itemByKey = useMemo(() => _.keyBy(items, 'key'), [items]);
  const rootItems = useMemo(
    () =>
      items.filter((item) => {
        if (meta.collapsed) {
          if (['divider', 'group'].includes(item.type)) return false;
          if (!item.parent || (itemByKey[item.parent] && itemByKey[item.parent].type === 'group')) {
            return true;
          } else {
            return false;
          }
        } else if (item.parent) {
          return false;
        }
        return true;
      }),
    [items, itemByKey, meta.collapsed],
  );

  const metaOnClick = meta.onClick;
  const handleMenuClick = useCallback(
    (args) => {
      const item = itemByKey[args.key];
      item && item.onClick && item.onClick(args);
      metaOnClick && metaOnClick(args);
      onClick && onClick(args);
    },
    [itemByKey, onClick, metaOnClick],
  );

  const activeKeys = meta.activeKeys || [];
  const loc = useLocation();
  const renderItem = (item) => {
    // Handle active status
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
    const itemProps = { ...item.props, icon: getIconNode(item) };
    const children = childrenByKey[item.key];

    let childNodes = null;
    if (children && children.length) {
      childNodes = children.map(renderItem);
    }

    if (item.type === 'divider') {
      return <Menu.Divider key={item.key} />;
    } else if (item.type === 'any') {
      return item.render(item, meta);
    } else if (item.type === 'group') {
      return (
        <Menu.ItemGroup key={item.key} title={item.label} {...itemProps}>
          {childNodes}
        </Menu.ItemGroup>
      );
    } else if (childNodes) {
      return (
        <Menu.SubMenu key={item.key} title={item.label} {...itemProps}>
          {childNodes}
        </Menu.SubMenu>
      );
    }
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

    return (
      <Menu.Item key={item.key} {...itemProps}>
        {labelContent}
      </Menu.Item>
    );
  };

  if (rootItems.length === 0) return null;
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
  };
  if (menuMode === 'inline') menuProps.inlineCollapsed = !!meta.collapsed;
  const menu = items.length ? (
    <Menu {...menuProps}>{rootItems.map(renderItem).filter(Boolean)}</Menu>
  ) : null;

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
    return menu ? <Dropdown overlay={menu}>{ele}</Dropdown> : ele;
  }
  return menu;
}
