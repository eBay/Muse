import axios from 'axios';
axios.interceptors.response.use(
  r => r,
  res => {
    console.log('error: ', res);
  },
);
