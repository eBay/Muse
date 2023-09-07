const axios = require('axios');

// A muse-core API wrapper to use an existing Muse API service.
// It uses post method for all requests.

module.exports = {
  create({ endpoint, token, axiosConfig, interceptors = {} }) {
    const headers = axiosConfig && axiosConfig.headers ? axiosConfig.headers : {};
    const client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      ...axiosConfig,
      headers: {
        authorization: token || '',
        ...headers,
      },
    });

    // Post data to the Muse API service
    const post = async (apiPath, args) => {
      try {
        let res;
        if (typeof FormData !== 'undefined' && args[0] instanceof FormData) {
          // For form data format
          res = await client.post(apiPath, args[0], {
            'Content-Type': 'multipart/form-data',
          });
        } else {
          // The server always receives args property
          res = await client.post(apiPath, { args });
        }
        return res.data?.data || res.data;
      } catch (err) {
        if (err && err.response && err.response.data && err.response.data.error) {
          const errorResponse = new Error(err.response.data.error);
          throw errorResponse;
        } else throw err;
      }
    };

    // Construct the API path by a javascript proxy
    const handler = {
      get(target, prop, receiver) {
        // apply and call are reserved
        if (['_api_path_', 'apply', 'call'].includes(prop)) return target[prop] || '';
        // you can always get the api endpoint by client.am.createApp._url
        if (prop === '_url') return `${endpoint}${receiver._api_path_ || ''}`;
        const apiPath = (receiver._api_path_ || '') + '/' + prop;

        // Allow interceptors to override the api path
        const propPath = apiPath.replace(/\//g, '.').replace(/^\./, '');
        if (interceptors?.[propPath]) {
          return interceptors[propPath];
        }
        const func = async (...args) => {
          return await post(apiPath, args);
        };
        func._api_path_ = apiPath;
        return new Proxy(func, handler);
      },
    };

    return new Proxy({}, handler);
  },
};
