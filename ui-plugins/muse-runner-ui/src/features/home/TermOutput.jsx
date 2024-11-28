import React, { useEffect, useCallback, useRef } from 'react';
import store from '@ebay/muse-lib-react/src/common/store';
import _ from 'lodash';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Terminal } from 'xterm';
import { useSelector } from 'react-redux';
import 'xterm/css/xterm.css';
import terminalOptions from './terminalOptions';

const terms = {};

function createTerminal(node) {
  const term = new Terminal(terminalOptions);
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.loadAddon(new WebLinksAddon());
  term.open(node);
  term.fitAddon = fitAddon;
  fitAddon.fit();

  return term;
}

function getTerm(id, container) {
  if (!terms[id]) {
    const div = document.createElement('div');
    div.style.height = '100%';
    div.style.width = '100%';
    container.appendChild(div);
    terms[id] = createTerminal(div, id);
  }
  return terms[id];
}

const writeOutputToTerm = (id, output, term) => {
  if (output && output.length) {
    output.forEach((text) => term.write(text));
    store.dispatch({
      type: 'CLEAR_MUSE_RUNNER_OUTPUT',
      payload: { id },
    });
  }
};
export default function TermOutput({ id }) {
  const output = useSelector((s) => s.pluginMuseRunnerUi.runnerOutput?.[id]);
  const termContainer = useRef(null);
  const term = useRef();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleResize = useCallback(
    _.debounce(() => {
      if (term.current) {
        term.current.fitAddon.fit();
      }
    }, 200),
    [],
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  useEffect(() => {
    const container = termContainer.current;
    if (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    term.current = getTerm(id, container);
    container.appendChild(term.current.element.parentNode);
    term.current.fitAddon.fit();
  }, [id]);

  useEffect(() => {
    if (output && term.current) writeOutputToTerm(id, output, term.current);
  }, [output, id]);

  return (
    <div className="w-full h-full">
      <div
        ref={termContainer}
        className="term-output-node w-full h-full p-3 bg-[rgb(9,32,42)]"
      ></div>
    </div>
  );
}

TermOutput.clear = (id) => {
  terms[id]?.clear();
};
