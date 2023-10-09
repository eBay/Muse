import '@ebay/muse-craco-plugin/lib/jest/__mocks__/museConfig.js';
import '@ebay/muse-craco-plugin/lib/jest/__mocks__/museEntries.js';
import './__mocks__/msgEngine.js';
import 'jest-location-mock';

window.MUSE_GLOBAL.app = { name : "test" };
window.MUSE_GLOBAL.env = { name : "staging" };
window.MUSE_GLOBAL.plugins = [{ name: "@ebay/muse-lib-react", subApps: [{
         mountPoint: 'default',
         name: 'musedemo',
         path: '/demo',
         url: 'https://demo.muse.qa.ebay.com',
       },]}];
window.MUSE_CONFIG = {...window.MUSE_GLOBAL };