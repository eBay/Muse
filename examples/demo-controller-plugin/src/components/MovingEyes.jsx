import { useRef, useCallback } from 'react';
import { useEvent } from 'react-use';
import _ from 'lodash';
import './MovingEyes.less';

export const MovingEyes = () => {
  const ref = useRef();
  const handleMouseMove = useCallback(evt => {
    _.forEach(ref.current.children, node => {
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
    <div className="moving-eyes" ref={ref}>
      <div className="eye-item"></div>
    </div>
  );
};

export default MovingEyes;
