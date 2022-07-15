const Transport = require('winston-transport');
const plugin = require('js-plugin');

const mockObj = {
  log: jest.fn(),
};
class TestTransport extends Transport {
  log(info, callback) {
    mockObj.log(info);
    callback();
  }
}

const testLoggerPlugin = {
  name: 'test plugin',
  museCore: {
    logger: {
      getTransports: () => {
        return new TestTransport();
      },
    },
  },
};

plugin.register(testLoggerPlugin);

describe('CreateLogger tests.', () => {
  beforeAll(() => {});
  beforeEach(() => {});

  it('Transports can be extended by muse-core plugin', async () => {
    const muse = require('./');
    muse.logger.getWinstonInstance().silent = false; // by default it's silent for testing
    muse.logger.info('abc');
    expect(mockObj.log).toBeCalledTimes(1);
    expect(mockObj.log).toBeCalledWith(expect.objectContaining({ message: 'abc' }));
  });
});
