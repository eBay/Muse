const expect = a => {
  return {
    toBe: b => {
      if (a !== b) throw new Error(`Expected ${a}, but received ${b}.`);
    },
  };
};

const museClient = require('./museClient').create({
  endpoint: 'https://musesvc.sample.com/api/v2',
});

try {
  expect(museClient._url).toBe('https://musesvc.sample.com/api/v2');
  expect(museClient.data.get._url).toBe('https://musesvc.sample.com/api/v2/data/get');
  expect(museClient.am.createApp._url).toBe('https://musesvc.sample.com/api/v2/am/create-app');

  console.log('✅ Test success.');
} catch (err) {
  console.log('❌ Test failed.');
  throw err;
}
