import * as os from 'node:os';
import * as pty from 'node-pty';
import { EventEmitter } from 'node:events';

/**
 * The reason we use node-pty is that it can keep output color?
 */

export default class Command extends EventEmitter {
  cwd;
  cmd;
  port;
  ptyArgs;
  constructor({ cwd, cmd, env, ptyArgs = {} }) {
    super();
    this.cwd = cwd;
    this.cmd = cmd;
    this.ptyArgs = ptyArgs;
    this.env = env;
  }
  start() {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

    const ptyProcess = pty.spawn(shell, ['-c', this.cmd], {
      name: 'xterm-instance',
      cols: 80,
      rows: 30,
      cwd: this.cwd,
      env: {
        ...process.env,
        ...this.env,
      },
      ...this.ptyArgs,
    });

    ptyProcess.onData((data) => {
      // process.stdout.write(data);
      // ptyProcess.on('data');
    });

    ptyProcess.onExit((code) => {
      this.emit('exit', code);
    });

    // ptyProcess.write('ls\r');
    // ptyProcess.resize(100, 40);
    // ptyProcess.write('ls\r');
    this.ptyProcess = ptyProcess;
    return ptyProcess;
  }

  terminate() {
    this.ptyProcess.kill();
  }
}
