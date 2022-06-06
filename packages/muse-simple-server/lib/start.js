const appName = process.argv[2];
const envName = process.argv[3];
console.log(appName, envName);
require('./server')({ appName, envName });
