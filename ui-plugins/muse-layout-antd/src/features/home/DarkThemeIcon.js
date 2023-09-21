import React from 'react';
import Icon from '@ant-design/icons';

const DarkThemeIconSvg = () => (
  <svg width="1em" height="1em" viewBox="0 0 512 512" version="1.1">
    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
fill="#currentColor" stroke="none">
<path d="M3191 4843 c-44 -22 -71 -67 -71 -121 0 -60 16 -84 121 -187 159
-157 270 -312 370 -518 279 -579 243 -1260 -96 -1806 -505 -816 -1546 -1119
-2410 -702 -207 99 -365 213 -525 375 -98 100 -123 116 -182 116 -54 0 -100
-27 -121 -73 -24 -49 -21 -86 12 -169 215 -543 633 -995 1156 -1253 219 -109
453 -182 710 -222 84 -14 167 -18 350 -17 212 1 257 4 385 27 901 161 1615
796 1874 1667 115 385 126 820 30 1225 -175 735 -721 1365 -1427 1644 -87 35
-127 38 -176 14z"/>
</g>
  </svg>
);

export default function DarkThemeIcon(props) {
  return <Icon component={DarkThemeIconSvg} aria-label="darktheme-icon" {...props} />;
}

DarkThemeIcon.propTypes = {};
DarkThemeIcon.defaultProps = {};
