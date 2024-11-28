import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from '../../../src/features/home';
import plugin from 'js-plugin';

describe('home/App', () => {

  beforeEach(() => {
    if (plugin.getPlugin('myplugin')) { plugin.unregister('myplugin') };
    if (plugin.getPlugin('myplugin2')) { plugin.unregister('myplugin2') };
  });

  it('renders App', () => {
    render(<App>Hello</App>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
  it('renders home.layout error', () => {
    plugin.register({
      name: 'myplugin',
      home: {
        mainLayout: (children) => {return <div>layout 1</div>}
      }
    });
    plugin.register({
      name: 'myplugin2',
      home: {
        mainLayout: (children) => { return <div>layout 2</div>}
      }
    });

    render(<App>Hello</App>);
    expect(screen.getByText(/Error: multiple layouts found from plugins: myplugin, myplugin2./)).toBeTruthy();
  });

  it('renders home.layout', () => {
    plugin.register({
      name: 'myplugin',
      home: {
        mainLayout: (layout) => <><div>layout 1</div><div>{layout.children}</div></>
      }
    });

    render(<App>Hello</App>);
    expect(screen.getByText(/layout 1/)).toBeTruthy();
    expect(screen.getByText(/Hello/)).toBeTruthy();
  });

  it('renders rootComponent ext point', () => {
    plugin.register({
      name: 'myplugin',
      rootComponent: () => {
        return <div>root component</div>
      },
    });

    render(<App>Hello</App>);
    expect(screen.getByText(/root component/)).toBeTruthy();
  });
});

