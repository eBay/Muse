import { $ } from 'zx';
import * as config from '../config.js';

const initMuse = async () => {
  //
  await $`muse init --registry=${config.NPM_REGISTRY}`;
};

export default initMuse;
