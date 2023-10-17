import os from 'os';
import * as pty from 'node-pty';
import fs from 'fs-extra';

const getSehll = () => {
  if (process.platform === 'win32') {
    // For windows 10 use powershell
    try {
      const ver = os.release().split('.').shift();
      if (parseInt(ver, 10) >= 10) return 'powershell.exe';
      // For windows 7 and below, use cmd.exe
      return 'cmd.exe';
    } catch (err) {
      return 'cmd.exe';
    }
  }
  // else {
  //   // Use system shell for Mac

  //   let source;
  //   ['.bash_profile', '.bashrc']
  //     .map(f => path.join(os.homedir(), f))
  //     .some(file => {
  //       if (fs.existsSync(file)) {
  //         source = file;
  //         return true;
  //       }
  //       return false;
  //     });
  //   console.log('bashrc: ', source);
  //   if (source) shellArgs.push('--rcfile', source);

  if (fs.existsSync('/bin/zsh')) return '/bin/zsh';
  return '/bin/bash';

  // }
};

export default function setupTerminals({ app }) {
  const terminals = {};
  const logs = {};

  // Create a terminal
  app.post('/api/terminals', function (req, res) {
    const { dir, cols, rows } = req.body;
    res.setHeader('Content-Type', 'application/json');
    if (terminals[dir]) {
      res.send(JSON.stringify({ pid: terminals[dir].pid }));
      res.end();
      return;
    }

    const shellArgs = [];
    const term = pty.spawn(getSehll(), shellArgs, {
      name: 'xterm-color',
      cols: cols || 80,
      rows: rows || 24,
      cwd: dir,
      env: process.env,
    });

    console.log('Created terminal with PID: ' + term.pid);
    terminals[dir] = term;
    logs[term.pid] = [];
    term.on('data', function (data) {
      const arr = logs[term.pid];
      arr.push(data);
      if (arr.length > 100) logs[term.pid] = arr.slice(arr.length - 100);
    });
    res.send(JSON.stringify({ pid: term.pid }));
    res.end();
  });

  // Resize the terminal
  app.post('/api/terminals/:pid/size', function (req, res) {
    const pid = parseInt(req.params.pid, 10);
    const { cols, rows } = req.body;
    const term = Object.values(terminals).find((t) => t.pid === pid);
    if (!term) {
      res.end(`No terminal with PID: ${pid}`);
      return;
    }
    term.resize(cols, rows);
    res.end('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
  });

  // Connect to the terminal
  app.ws('/api/terminals/:pid', function (ws, req) {
    console.log('Connecting to terminal ' + req.params.pid);
    const term = Object.values(terminals).find((t) => t.pid === parseInt(req.params.pid, 10));

    console.log('Connect to terminal ' + term.pid);
    if (!term) throw new Error('Terminal not found');

    ws.send(logs[term.pid].join(''));

    term.on('data', function (data) {
      try {
        ws.send(data);
      } catch (ex) {
        // The WebSocket is not open, ignore
      }
    });
    ws.on('message', function (msg) {
      term.write(msg);
    });
    // ws.on('close', function () {
    // console.log('Closed terminal ' + term.pid);
    // term.kill();
    // Clean things up
    // delete terminals[term.pid];
    // delete logs[term.pid];
    // });
  });
}
