import axios from 'axios';
import { notification } from 'antd';

const mg = window.MUSE_GLOBAL;
export const apiHost = mg.isLocal
  ? window.MUSE_GLOBAL.getAppVariables()?.museRunnerApiHost || 'localhost:6066'
  : document.location.host;

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
