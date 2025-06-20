// A singleton history object for easy API navigation

import { createHashHistory, createMemoryHistory, createBrowserHistory } from 'history';

const routerType = window.MUSE_GLOBAL?.appConfig?.routerType || 'browser';

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

export default history;
