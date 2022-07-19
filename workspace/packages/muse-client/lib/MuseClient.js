const axios = require('axios');
const kebabCase = require('lodash/fp/kebabCase');

class MuseClient {
  constructor({ endpoint, token, axiosConfig }) {
    this.client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      ...axiosConfig,
    });
    this.token = token;
  }

  async get(name, args, config) {
    if (!Array.isArray(args)) args = [args];
    const res = await this.client.get(
      name
        .split('.')
        .map(kebabCase)
        .join('/'),
      {
        params: { args: encodeURIComponent(JSON.stringify(args || [])) },
        ...config,
        headers: {
          authorization: this.token || '',
          ...config?.headers,
        },
      },
    );
    return res.data?.data;
  }
  async post(name, args, config) {
    const res = await this.client.post(
      name
        .split('.')
        .map(kebabCase)
        .join('/'),
      args || {},
      {
        ...config,
        headers: {
          authorization: this.token || '',
          ...config?.headers,
        },
      },
    );
    return res.data?.data;
  }
}

module.exports = MuseClient;
