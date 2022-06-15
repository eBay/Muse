const winston = require('winston');
const { MESSAGE } = require('triple-beam');
const _ = require('lodash');
const config = require('./config');

// const plugin = require('js-plugin');

// levels: {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6,
// }

function getTimestamp(d) {
  const now = new Date(d);
  const m = _.padStart(now.getMinutes(), 2, '0');
  const s = _.padStart(now.getSeconds(), 2, '0');
  const mms = _.padStart(now.getMilliseconds(), 3, '0');
  return `${m}:${s}.${mms}`;
}
module.exports = (name) => {
  const logger = winston.createLogger({
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
    transports: [new winston.transports.Console({})],
  });

  return logger;
};
