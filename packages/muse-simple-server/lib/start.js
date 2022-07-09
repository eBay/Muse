const appName = process.argv[2];
const envName = process.argv[3];
const isDev = Array.from(process.argv).includes('--dev');
const appByUrl = Array.from(process.argv).includes('--app-by-url');
console.log(appName, envName);
require('./server')({ appName, envName, isDev, appByUrl });
