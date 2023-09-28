import React from 'react';
import { render } from '@testing-library/react';
import store from '../src/common/store';
import Root from '../src/Root';

describe('Root', () => {
  it('Root has no error', () => {
    const DumpContainer = () => <div className="container">{this.props.children}</div>;
    const NotFoundComp = () => <div className="not-found">Not found</div>;
    const routes = [{
      childRoutes: [
        { path: '/', component: DumpContainer, childRoutes: [{ path: 'abc' }] },
        { path: '/root', autoIndexRoute: true },
        { path: 'relative-path', name: 'Link Name' },
        {
          path: 'sub-links',
          childRoutes: [
            { path: 'sub-link' },
          ],
        },
        { path: '*', component: NotFoundComp },
      ],
    }];

    render(<Root store={store} routeConfig={routes} />);

  });
});
