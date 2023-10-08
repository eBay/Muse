import React from 'react';
import { render, screen } from '@testing-library/react';
import Root from '../src/Root';
import plugin from 'js-plugin';

describe('Root', () => {

  beforeEach(() => {
    if (plugin.getPlugin('myplugin')) { plugin.unregister('myplugin') };
    if (plugin.getPlugin('myplugin2')) { plugin.unregister('myplugin2') };
  });

  it('Root has no error', () => {
    render(<Root />);
    // check that default homepage is rendered
    expect(screen.getByText('Welcome to Muse!')).toBeTruthy();
  });

  it('Root has error: multiple homepages', () => {

    plugin.register({
      name: 'myplugin',
      home: {
        homepage: () => {return <div>homepage 1</div>}
      }
    });
    plugin.register({
      name: 'myplugin2',
      home: {
        homepage: () => { return <div>homepage 2</div>}
      }
    });

    render(<Root />);
    // check that multiple homepage extension points shows error
    expect(screen.getByText(/Failed to show homepage: multiple homepages found from: myplugin, myplugin2./)).toBeTruthy();
  });
});
