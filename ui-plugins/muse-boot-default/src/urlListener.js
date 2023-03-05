// Notify the parent of the url change
// subapp => parent
// In muse-react/src/common/history handle url change msg

import msgEngine from './msgEngine';

const patchHistoryMethod = (method) => {
  const history = window.history;
  const original = history[method];

  history[method] = function (state) {
    const result = original.apply(this, arguments);
    const event = new Event('muse_boot_' + method.toLowerCase());
    event.state = state;
    window.dispatchEvent(event);
    return result;
  };
};

patchHistoryMethod('pushState');
patchHistoryMethod('replaceState');

const handleUrlChange = () => {
  msgEngine.sendToParent({
    type: 'child-route-change',
    path: document.location.href.replace(document.location.origin, ''),
  });
};
window.addEventListener('popstate', handleUrlChange);
window.addEventListener('muse_boot_pushstate', handleUrlChange);
window.addEventListener('muse_boot_replacestate', handleUrlChange);
