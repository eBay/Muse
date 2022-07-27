import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import _ from 'lodash';
import plugin from 'js-plugin';
import { HeaderItem } from './';
import { useSetSiderCollapsed } from './redux/hooks';
import museIcon from '../../images/muse.png';

function getUserMenuItem() {
  const mc = window.MUSE_CONFIG;
  return {
    key: 'userAvatar',
    type: 'menu',
    position: 'right',
    order: 9999999,
    menuMeta: {
      autoSort: true,
      baseExtPoint: 'headerusermenu',
      trigger: {
        label: mc.getUser().username,
      },
      items: [
        {
          key: 'logout',
          label: 'Log Out',
          order: 100,
          onClick: () => {
            if (!mc.logout) {
              Modal.error({ title: 'Error', content: 'No logout method on MUSE_CONFIG.' });
            } else {
              mc.logout();
            }
          },
        },
      ],
    },
  };
}

export default function Header() {
  const headerConfig = plugin.invoke('museLayout.header.getConfig')[0] || {
    backgroundColor: '#039be5',
    icon: museIcon,
    title: 'Muse App',
    noUserMenu: false,
    subTitle: 'Build UI apps with ease!',
  };

  const siderConfig = plugin.invoke('museLayout.sider.getConfig')[0] || {
    mode: 'collapsable',
  };
  const navigate = useNavigate();
  let { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();
  if (siderCollapsed === null) {
    if (typeof siderConfig.siderDefaultCollapsed !== 'undefined') {
      siderCollapsed = !!siderConfig.siderDefaultCollapsed;
    } else {
      siderCollapsed = true;
    }
  }
  const headerItems = [];

  let realHeaderItems = [
    // eslint-disable-line
    ...headerItems,
    ..._.flatten(plugin.invoke('museLayout.header.getItems')),
  ].map((item) => (item.order ? item : { ...item, order: 1 }));

  if (
    !headerConfig.noUserMenu &&
    window.MUSE_CONFIG.getUser &&
    window.MUSE_CONFIG.getUser() &&
    !plugin.getPlugin('muse-cc')
  ) {
    realHeaderItems.push(getUserMenuItem());
  }

  // Support set parent menu item, allow to set parentMenu to add menu items to header
  // const parentItems = _.groupBy(realHeaderItems.filter(item => !!item.parentMenu), 'parentMenu');
  // realHeaderItems = realHeaderItems
  //   .filter(item => !item.parentMenu)
  //   .map(item => {
  //     if (item.type === 'menu' && item.menuMeta && item.menuMeta.items && parentItems[item.key]) {
  //       return {
  //         ...item,
  //         menuMeta: {
  //           ...item.menuMeta,
  //           items: [...item.menuMeta.items, ...parentItems[item.key]],
  //         },
  //       };
  //       return item;
  //     } else {
  //       return item;
  //     }
  //   });

  plugin.sort(realHeaderItems);
  plugin.invoke('museLayout.header.processItems', realHeaderItems);

  const [leftItems, centerItems, rightItems] = useMemo(() => {
    const left = [];
    const center = [];
    const right = [];
    realHeaderItems.forEach((item) => {
      if (item.position === 'center') center.push(item);
      else if (item.position === 'right') right.unshift(item);
      else left.push(item);
    });
    return [left, center, right];
  }, [realHeaderItems]);

  const gotoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleHeaderClick = useCallback(() => {
    if (siderConfig.mode === 'drawer' && !siderCollapsed) {
      setSiderCollapsed(true);
    }
  }, [siderConfig.mode, siderCollapsed, setSiderCollapsed]);

  const handleToggleSiderCollapsed = useCallback(() => {
    setSiderCollapsed(!siderCollapsed);
  }, [siderCollapsed, setSiderCollapsed]);

  const headerStyle = {};
  if (headerConfig.backgroundColor) headerStyle.backgroundColor = headerConfig.backgroundColor;

  const renderItems = (items) => {
    return items.map((item) => <HeaderItem meta={item} key={item.key} />);
  };

  const centerContainerStyle = {};
  if (centerItems.length > 0) {
    centerContainerStyle.gridTemplateColumns = `1fr ${_.repeat('auto ', centerItems.length)}1fr`;
  }
  const noTitle = !headerConfig.title && !headerConfig.icon;
  return (
    <div className="muse-layout_home-header" style={headerStyle} onClick={handleHeaderClick}>
      {siderConfig.mode === 'drawer' && (
        <HeaderItem
          meta={{
            icon: 'MenuOutlined',
            className: 'header-item-menu header-item-toggle-drawer',
            onClick: handleToggleSiderCollapsed,
          }}
        />
      )}
      {!noTitle && (
        <span className="header-item header-item-title">
          {headerConfig.icon && <img src={headerConfig.icon} alt="" onClick={gotoHome} />}
          {headerConfig.title && <h1 onClick={gotoHome}>{headerConfig.title}</h1>}
          {headerConfig.subTitle && <p>{headerConfig.subTitle}</p>}
        </span>
      )}
      {renderItems(leftItems)}
      {centerItems.length > 0 && (
        <div className="header-item-center-container" style={centerContainerStyle}>
          <span />
          {renderItems(centerItems)}
          <span />
        </div>
      )}
      {renderItems(rightItems)}
    </div>
  );
}
