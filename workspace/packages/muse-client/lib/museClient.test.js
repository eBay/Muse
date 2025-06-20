const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');

const mock = new MockAdapter(axios);

mock.onPost('https://musesvc.sample.com/api/v3/am/createApp').reply(200, {
  data: {
    appName: 'foo',
  },
});

const expect = (a) => {
  return {
    toBe: (b) => {
      if (a !== b) throw new Error(`Expected ${b}, but received ${a}.`);
    },
  };
};

const museClient = require('./museClient').create({
  endpoint: 'https://musesvc.sample.com/api/v2',
  interceptors: {
    'data.get': (key) => `hello ${key}`,
  },
});

(async () => {
  try {
    expect(museClient._url).toBe('https://musesvc.sample.com/api/v2');
    museClient.baseUrl = 'https://musesvc.sample.com/api/v3';
    expect(museClient.am.createApp._url).toBe('https://musesvc.sample.com/api/v3/am/createApp');
    expect((await museClient.am.createApp()).appName).toBe('foo');
    museClient.baseUrl = 'https://musesvc.sample.com/api/v2';
    expect(museClient.pm.creatE2eTest._url).toBe(
      'https://musesvc.sample.com/api/v2/pm/creatE2eTest',
    );
    expect(museClient.data.get('app')).toBe('hello app');

    console.log('✅ Test success.');
  } catch (err) {
    console.log('❌ Test failed.');
    throw err;
  }
})();
