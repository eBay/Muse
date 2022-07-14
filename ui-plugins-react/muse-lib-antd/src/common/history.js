import { createBrowserHistory } from 'history';

// A singleton history object for easy API navigation
const history = createBrowserHistory();
window.MUSE_ANTD_HISTORY = history;
export default history;
