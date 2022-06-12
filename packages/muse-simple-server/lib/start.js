const appName = process.argv[2];
const envName = process.argv[3];
const isDev = Array.from(process.argv).includes('--dev');
console.log(appName, envName);
require('./server')({ appName, envName, isDev });
