import axios from 'axios';
console.log('auth failed');
axios.interceptors.response.use(
  r => r,
  res => {
    console.log('error: ', res);
  },
);
