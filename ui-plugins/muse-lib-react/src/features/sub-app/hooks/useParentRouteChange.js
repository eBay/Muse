import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useParentRouteChange() {
  const navigate = useNavigate();

  useEffect(() => {
    window.MUSE_GLOBAL?.msgEngine?.addListener('muse-react_history', msg => {
      // Parent may notify the child iframe to update url: implemented in SubAppContainer
      // muse-boot will notify parent when child iframe url changed
      const currentPath = document.location.href.replace(document.location.origin, '');
      if (msg.type === 'parent-route-change' && msg.path !== currentPath) {
        console.log('parent-route-change: ', msg.path);
        navigate(msg.path);
      }
    });
    return () => {
      window.MUSE_GLOBAL?.msgEngine?.removeListener('muse-react_history');
    };
  }, [navigate]);
}

export default useParentRouteChange;
