const Transport = require('winston-transport');
const plugin = require('js-plugin');

const mockObj = {
  log: jest.fn(),
};
class TestTransport extends Transport {
  log(info, callback) {
    console.log('log called', info);
    mockObj.log(info);
    callback();
  }
}

const testLoggerPlugin = {
  name: 'test plugin',
  museCore: {
    logger: {
      getTransports: () => {
        console.log('get transport');
        return new TestTransport();
      },
    },
  },
};

plugin.register(testLoggerPlugin);

const muse = require('./');

describe('CreateLogger tests.', () => {
  beforeAll(() => {});
  beforeEach(() => {});

  it('Transports can be extended by muse-core plugin', async () => {
    muse.logger.silent = false; // by default it's silent for testing
    muse.logger.info('abc');
    expect(mockObj.log).toBeCalledTimes(1);
    expect(mockObj.log).toBeCalledWith(expect.objectContaining({ message: 'abc' }));
  });
});
