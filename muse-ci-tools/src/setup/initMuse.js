import { $ } from 'zx';
import * as config from '../config.js';

const initMuse = async () => {
  //
  await $`muse init --registry=${config.TARGET_NPM_REGISTRY}`;
};

export default initMuse;
