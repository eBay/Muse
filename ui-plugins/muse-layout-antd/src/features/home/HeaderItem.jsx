import React, { useCallback } from 'react';
import getIconNode from './getIconNode';
import { useNavigate } from 'react-router-dom';
import { MetaMenu } from '@ebay/muse-lib-antd/src/features/common';

export default function HeaderItem({ meta }) {
  const navigate = useNavigate();
  const { label, link, linkTarget, onClick, icon, className = '' } = meta;
  const handleClick = useCallback(
    (evt) => {
      onClick && onClick(evt);
      if (link) {
        if (linkTarget === '_blank') {
          window.open(link);
        } else {
          if (link.startsWith('http:') || link.startsWith('https:')) {
            window.location.assign(link);
          } else {
            navigate(link);
          }
        }
      }
    },
    [link, linkTarget, onClick],
  );

  if (meta.render) {
    return meta.render();
  }
  const classnames = ['header-item', className];
  if (meta.link || meta.onClick || meta.type === 'menu') {
    classnames.push('header-item-menu');
  }
  if (meta.position === 'right') classnames.push('header-item-right');
  if (meta.position === 'center') classnames.push('header-item-center');
  if (meta.type === 'menu') {
    const menuMeta = {
      ...meta.menuMeta,
      trigger: {
        ...meta.menuMeta?.trigger,
        className: `${meta.menuMeta?.trigger?.className || ''} ${classnames.join(' ')}`,
      },
    };
    return (
      <MetaMenu
        meta={menuMeta}
        baseExtPoint={meta.noExtPoint ? '' : `museLayout.header.${meta.key}`}
      />
    );
  }
  const iconNode = getIconNode({ icon });
  return (
    <span className={`muse-layout_home-header-item  ${classnames.join(' ')}`} onClick={handleClick}>
      <span>
        {iconNode}
        {label && <span className="header-item-label">{label}</span>}
      </span>
    </span>
  );
}
