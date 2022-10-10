import { useRef, useEffect, useCallback } from 'react';
import { Button, Popover, Switch } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useEvent } from 'react-use';
import _ from 'lodash';
import './MovingEyes.less';

export const MovingEyes = () => {
  const ref1 = useRef();
  const ref2 = useRef();
  const handleMouseMove = useCallback(evt => {
    [ref1, ref2].forEach(r => {
      const node = r.current;
      const rect = node.getBoundingClientRect();
      const x = rect.x + rect.width / 2;
      const y = rect.y + rect.height / 2;
      const rad = Math.atan2(evt.pageX - x, evt.pageY - y);
      const rot = rad * (180 / Math.PI) * -1 + 180;
      node.style.transform = `rotate(${rot}deg)`;
    });
  }, []);
  useEvent('mousemove', handleMouseMove);
  return (
    <div className="moving-eyes">
      <div className="eye-item" ref={ref1}></div>
      <div className="eye-item" ref={ref2}></div>
    </div>
  );
};

export default MovingEyes;
