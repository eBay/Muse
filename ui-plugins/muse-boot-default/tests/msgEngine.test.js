import { screen, waitFor } from '@testing-library/react';
import msgEngine from '../src/msgEngine';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('muse-boot-default', () => {
  // read the msgEngine.js code and make it ES6 compliant for tests, without using Babel
  const msgEngineScript = fs.readFileSync(path.resolve(__dirname, '../src/msgEngine.js'), 'utf8'); //--> get the file content
  const parsedMsgEngineScript = msgEngineScript.replace('export default msgEngine;', ''); // remove the unnecessary export sentence

  // the iframe content will also initialize the msgEngine
  const jsdom = new JSDOM(
    `<!doctype html><html><head><script>${parsedMsgEngineScript}; msgEngine.init();</script></head><body><div id="app"></div></body></html>`,
    { runScripts: 'dangerously' },
  );

  const mg = {
    app: { name: 'dummy-app' },
    env: { name: 'test' },
    appName: 'dummy-app',
    envName: 'test',
  };

  const { top, self } = window;
  Object.defineProperty(window, 'MUSE_GLOBAL', { value: mg, writable: true });

  beforeAll(() => {
    // overwrite window.top and window.self to simulate an iframe
    delete window.top;
    delete window.self;
    window.top = { ...top };
    window.self = jsdom.window;
    jest.useFakeTimers();
    msgEngine.init();
  });

  afterAll(() => {
    window.top = top;
    window.self = self;
  });

  it('msgEngine default listener', async () => {
    await waitFor(() => expect(Object.keys(msgEngine.listeners).length).toBe(1));
    //ensure we are simulating an iframe
    expect(window.top).not.toBe(window.self);

    // add iframe reference to the msgEngine
    msgEngine.register('child-iframe', window.self);
    //var frame = window.top.createElement('iframe');
    //frame.onload = msgEngine.init();
    //window.top.body.appendChild(frame);
  });
});
