import * as url from 'url';
import MochaRunner from '../../MochaRunner.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const start = async () => {
  const runner = new MochaRunner({
    root: __dirname,
  });
  await runner.run();
};

export default start;
