import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Layout } from 'antd';
import _ from 'lodash';
import plugin from 'js-plugin';
import { HeaderItem } from './';
import { useSetSiderCollapsed } from './redux/hooks';
import { useSetIsDarkMode } from '@ebay/muse-lib-antd/src/features/common/redux/hooks';
import { DynamicThemeIcon, DarkThemeIcon } from './';
import museIcon from '../../images/muse.png';
const { Header: AntdHeader } = Layout;

function getUserMenuItem() {
  const museGlobal = window.MUSE_GLOBAL;

  return {
    key: 'userAvatar',
    type: 'menu',
    position: 'right',
    order: 9999999,
    menuMeta: {
      autoSort: true,
      baseExtPoint: 'headerusermenu',
      trigger: {
        label: museGlobal.getUser().username,
      },
      items: [
        {
          key: 'logout',
          label: 'Log Out',
          order: 100,
          onClick: () => {
            if (!museGlobal.logout) {
              Modal.error({ title: 'Error', content: 'No logout method on MUSE_GLOBAL.' });
            } else {
              museGlobal.logout();
            }
          },
        },
      ],
    },
  };
}

export default function Header({ siderConfig }) {
  const { setIsDarkMode, isDarkMode } = useSetIsDarkMode();

  function getDynamicThemeSwitch() {
    const handleSwitchThemeClick = () => {
      setIsDarkMode(!isDarkMode);
    };

    return {
      key: 'switch-theme',
      type: 'switch',
      position: 'right',
      order: 9999998,
      render: () => {
        return !isDarkMode ? (
          <DynamicThemeIcon
            onClick={handleSwitchThemeClick}
            title={`Switch between dark / light themes`}
            className="header-switch-theme"
          />
        ) : (
          <DarkThemeIcon
            onClick={handleSwitchThemeClick}
            title={`Switch between dark / light themes`}
            className="header-switch-theme"
          />
        );
      },
    };
  }

  const headerConfig = plugin.invoke('museLayout.header.getConfig')[0] || {
    backgroundColor: '#039be5',
    icon: museIcon,
    title: 'Muse App',
    noUserMenu: false,
    themeSwitcher: false,
    subTitle: 'Build UI apps with ease!',
  };

  const navigate = useNavigate();
  const { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();
  const headerItems = [];

  let realHeaderItems = [
    // eslint-disable-line
    ...headerItems,
    ..._.flatten(plugin.invoke('museLayout.header.getItems')),
  ].map((item) => (item.order ? item : { ...item, order: 1 }));

  if (!headerConfig.noUserMenu && window.MUSE_GLOBAL.getUser && window.MUSE_GLOBAL.getUser()) {
    realHeaderItems.push(getUserMenuItem());
    if (headerConfig.themeSwitcher) {
      realHeaderItems.push(getDynamicThemeSwitch());
    }
  } else {
    if (headerConfig.themeSwitcher) {
      realHeaderItems.push(getDynamicThemeSwitch());
    }
  }

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
    <AntdHeader className="muse-layout-header" style={{ ...headerStyle }}>
      {siderConfig?.mode === 'drawer' && (
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
          {headerConfig.icon && (
            <img src={headerConfig.icon} alt="" aria-label="header-icon" onClick={gotoHome} />
          )}
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
    </AntdHeader>
  );
}
