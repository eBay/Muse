import axios from 'axios';
import { notification } from 'antd';
const baseURL = window.MUSE_GLOBAL.isLocal
  ? 'http://localhost:6066/api'
  : `http://${document.location.host}/api`;
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
