import history from '../../common/history';
export { default as SubAppContainer } from './SubAppContainer';
export { default as FixedSubAppContainer } from './FixedSubAppContainer';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as SubAppContext } from './SubAppContext';
export { default as C2SProxyFailed } from './C2SProxyFailed';

window.MUSE_GLOBAL?.msgEngine?.addListener('muse-react_history', msg => {
  // Parent may notify the child iframe to update url: implemented in SubAppContainer
  // muse-boot will notify parent when child iframe url changed
  const currentPath = document.location.href.replace(document.location.origin, '');
  if (msg.type === 'parent-route-change' && msg.path !== currentPath) {
    history.push(msg.path);
  }
});
