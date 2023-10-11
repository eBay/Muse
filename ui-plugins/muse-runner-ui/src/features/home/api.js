import axios from 'axios';
import { notification } from 'antd';

const mg = window.MUSE_GLOBAL;
export const apiHost = mg.isLocal
  ? // For local development, need to config it or use the default 6066 port.
    window.MUSE_GLOBAL.getAppVariables()?.museRunnerApiHost || 'localhost:6066'
  : // when published, always with muse-runner nodejs backend, so use the same host
    document.location.host;

const baseURL = `http://${apiHost}/api`;
const api = axios.create({
  baseURL,
});

api.interceptors.response.use(
  (res) => {
    if (res.data && res.data.code === 0) {
    }
    return res;
  },
  (err) => {
    if (err?.response?.status === 500) {
      notification.error({
        message: 'Request failed',
        description: err?.response?.data,
        duration: 0,
      });
    }
    return Promise.reject(err);
  },
);
api.baseURL = baseURL;

export default api;
