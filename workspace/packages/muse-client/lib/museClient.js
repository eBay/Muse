const axios = require('axios');
const kebabCase = require('lodash/fp/kebabCase');

// A muse-core API wrapper to use an existing Muse API service.
// It uses post method for all requests.

module.exports = {
  create({ endpoint, token, axiosConfig }) {
    const client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      ...axiosConfig,
      headers: {
        authorization: token || '',
        ...axiosConfig?.headers,
      },
    });
    const post = async (apiPath, args) => {
      try {
        const res = await client.post(apiPath, { args });
        return res.data?.data;
      } catch (err) {
        //
        if (err?.response?.data?.error) {
          const err2 = new Error(err?.response?.data?.error);
          throw err2;
        } else throw err;
      }
    };

    // Construct the API path by a javascript proxy
    const handler = {
      get(target, prop, receiver) {
        if (['_api_path_', 'apply', 'call'].includes(prop)) return target[prop] || '';
        const apiPath = (receiver._api_path_ || '') + '/' + kebabCase(prop);
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
