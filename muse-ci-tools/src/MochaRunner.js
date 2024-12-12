import Mocha from 'mocha';
import debug from 'debug';
import { glob } from 'glob';
import path from 'path';
import reporter from './reporter.js';

const log = debug('mocha-runner');

export default class MochaRunner {
  constructor(params) {
    this.params = params;
    this.mochaInstance = new Mocha({
      timeout: 10000,
      ...params?.mochaOptions,
    });
  }

  async run() {
    const { root = process.cwd(), grep = '*.test.js', name = 'mocha tests' } = this.params;
    console.log('root', root);
    log('start run: ', name);
    // const root = this.params.root || process.cwd();
    // const grep = this.params.grep || '**/*.test.mjs';
    glob.sync(path.join(root, grep), { ignore: 'node_modules/**' }).forEach((f) => {
      this.mochaInstance.addFile(f);
    });

    // Need to call loadFilesAsync to support esm
    await this.mochaInstance.loadFilesAsync();

    await new Promise((resolve, reject) => {
      const runner = this.mochaInstance.run((failures) => {
        if (failures) {
          reject('mocha test failed');
        } else resolve();
        log('end run', name);
        reporter.addResult();
      });

      runner.on(Mocha.Runner.constants.EVENT_SUITE_END, (suite) => {
        console.log('suite end');
        reporter.addResult(suite);
      });
    });
  }
}
