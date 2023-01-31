# muse-setup-cra

Config an empty create-react-app application to be a Muse plugin project.

1. Install Muse dependencies

- @craco/craco
- @ebay/muse-core
- @ebay/muse-cra-patch
- @ebay/muse-craco-plugin
- @ebay/muse-lib-react

2. Update `package.json` to have muse config

```json
"muse": {
  "devConfig": {
    "app": "myapp",
    "env": "staging"
  },
  "type": "normal"
}
```

3. Update scripts in `package.json`

```json
"scripts": {
  "start": "cross-env PORT=3033 muse-cra-patch && craco start",
  "build": "muse-cra-patch && craco build",
  "build:dev": "cross-env MUSE_DEV_BUILD=true muse-cra-patch && craco build",
  "prestart": "muse-ebay-dev check-updates",
  "prebuild": "muse-ebay-dev check-updates",
}
```

4. Add `craco.config.js`

```js
const MuseCracoPlugin = require('@ebay/muse-craco-plugin');

module.exports = () => {
  return {
    plugins: [{ plugin: MuseCracoPlugin }],
  };
};
```

5. Update `src/index.js` to be a Muse entry file

```js
import plugin from 'js-plugin';
import * as ext from './ext';
import route from './route';
import reducer from './reducer';

plugin.register({
  ...ext,
  name: 'myplugin', // The plugin name same with which in package.json
  route,
  reducer,
});
```

6. Delete `public/index.html`

## Manual Config without craco
