const winston = require('winston');
const { MESSAGE } = require('triple-beam');
const plugin = require('js-plugin');
const _ = require('lodash');
const config = require('./config');

// levels: {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6,
// }

function getTimestamp(date) {
  const now = new Date(date);
  const m = _.padStart(now.getMinutes(), 2, '0');
  const s = _.padStart(now.getSeconds(), 2, '0');
  const mms = _.padStart(now.getMilliseconds(), 3, '0');
  return `${m}:${s}.${mms}`;
}

function createLogger(name) {
  let logger = null;
  const getLogger = () => {
    if (!logger) {
      const transports = _.flatten(plugin.invoke('museCore.logger.getTransports'));
      transports.push(new winston.transports.Console({}));
      logger = winston.createLogger({
        level: config.get('logLevel') || 'info',
        silent: process.env.NODE_ENV === 'test',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.timestamp(),
          {
            transform: (info) => {
              info[MESSAGE] = `${info.level} [${info.name}] ${getTimestamp(info.timestamp)} ${
                info.message
              }`;
              return info;
            },
          },
        ),
        defaultMeta: { name },
        exitOnError: false,
        transports,
      });
    }
    return logger;
  };
  const wrappedLogger = {};
  ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'].forEach((name) => {
    Object.assign(wrappedLogger, {
      // get [name]() {
      // console.log('get metd');
      [name]: (...args) => {
        if (!config.__pluginLoaded) {
          throw new Error(
            "Muse logger should NOT be used before all plugins are loaded. Usually because it's used in the global scope in a plugin.",
          );
        }
        getLogger()[name](...args);
      },
      getWinstonInstance() {
        return getLogger();
      },
    });
  });

  return wrappedLogger;
}

const logger = createLogger('default');
logger.createLogger = createLogger;
module.exports = logger;
