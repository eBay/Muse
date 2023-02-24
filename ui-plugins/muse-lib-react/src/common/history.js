// A singleton history object for easy API navigation

import { createHashHistory, createMemoryHistory, createBrowserHistory } from 'history';

const routerType = window.MUSE_CONFIG?.appConfig?.routerType || 'browser';

let historyCreator;

switch (routerType) {
  case 'browser':
    historyCreator = createBrowserHistory;
    break;
  case 'memory':
    historyCreator = createMemoryHistory;
    break;
  case 'hash':
    historyCreator = createHashHistory;
    break;
  default:
    historyCreator = createBrowserHistory;
    break;
}
const history = historyCreator();

window.MUSE_CONFIG?.msgEngine?.addListener('muse-react_history', msg => {
  // Parent may notify the child iframe to update url: implemented in SubAppContainer
  // muse-boot will notify parent when child iframe url changed
  if (msg.type === 'parent-route-change') {
    const url = document.location.href.replace(document.location.origin, '');
    if (msg.url !== url) {
      history.push(msg.url);
    }
  }
});

export default history;
