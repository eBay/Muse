import * as url from 'url';
import { $ } from 'zx';
import MochaRunner from '../../../../MochaRunner.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const appCreated = async () => {
  const runner = new MochaRunner({
    root: __dirname,
  });
  await runner.run();
};

export default appCreated;
