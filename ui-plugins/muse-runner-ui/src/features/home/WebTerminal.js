import React, { useEffect, useCallback, useRef, useState } from 'react';
import _ from 'lodash';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { AttachAddon } from 'xterm-addon-attach';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import terminalOptions from './terminalOptions';
import api from './api';

const terms = {};

const termOptions = {
  ...terminalOptions,
  cursorBlink: true,
  disableStdin: false,
  cursorStyle: 'block',
  theme: {
    foreground: 'rgb(204, 204, 204)',
    background: 'rgb(9, 32, 42)',
    selectionBackground: 'rgb(46, 69, 66)',
    cursorAccent: 'rgb(9, 32, 42)',
  },
  screenKeys: true,
  applicationCursor: true,
  mouseEvents: true,
};
function createTerminal(node, pid) {
  const term = new Terminal(termOptions);
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.loadAddon(new WebLinksAddon());
  term.open(node);
  term.fitAddon = fitAddon;
  fitAddon.fit();
  // http://localhost:6066/api
  const socketUrl = `${api.baseURL.replace('http://', 'ws://')}/terminals/${pid}`;
  const socket = new WebSocket(socketUrl);
  const attachAddon = new AttachAddon(socket);

  // Attach the socket to term
  term.loadAddon(attachAddon);
  return term;
}

function getTerm(pid, container) {
  if (!terms[pid]) {
    const div = document.createElement('div');
    div.style.height = '100%';
    div.style.width = '100%';
    container.appendChild(div);
    terms[pid] = createTerminal(div, pid);
  }
  return terms[pid];
}

export default function WebTerminal({ dir }) {
  const [termPid, setTermPid] = useState(null);
  useEffect(() => {
    api.post('/terminals', { dir }).then((res) => {
      setTermPid(res.data.pid);
    });
  }, [dir]);
  const termContainer = useRef(null);
  const term = useRef();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleResize = useCallback(
    _.debounce(() => {
      if (term.current) {
        term.current.fitAddon.fit();
        api.post(`/terminals/${termPid}/size`, {
          rows: term.current.rows,
          cols: term.current.cols,
        });
      }
    }, 200),
    [termPid],
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  useEffect(() => {
    if (!termPid) return;
    const container = termContainer.current;
    if (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    term.current = getTerm(termPid, container);
    container.appendChild(term.current.element.parentNode);
    term.current.fitAddon.fit();
    handleResize();
  }, [dir, termPid, handleResize]);

  useEffect(() => {
    if (termPid && term.current) {
      term.current.focus();
    }
  }, [termPid]);

  if (!termPid) return null;
  return (
    <div className="w-full h-full">
      <div
        ref={termContainer}
        className="term-output-node w-full h-full p-3 bg-[rgb(9,32,42)]"
      ></div>
    </div>
  );
}
