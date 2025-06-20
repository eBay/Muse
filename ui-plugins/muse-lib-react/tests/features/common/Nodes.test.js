import React from 'react';
import nodes from '../../../src/features/common/Nodes';
import plugin from 'js-plugin';
import { PageNotFound } from '../../../src/features/common';

describe('utils.js', () => {

    beforeEach(() => {
        if (plugin.getPlugin('demo')) { plugin.unregister('demo') };
    });

    it('Nodes', () => {

        plugin.register({
            name: 'demo',
            muse: {
                configureNumbers : {
                    preProcessItems: () => {},
                    getItems: () => [{ render: () => <PageNotFound/> }, { content: <PageNotFound/> }, { component: () => <PageNotFound/> }],
                    processItems: () => {},
                    postProcessItems: () => {},
                },
            }
          });

        const numbers = [1];

        const extendedNodes = nodes({ items: [], extName: 'items', extBase: 'muse.configureNumbers', extArgs: {} });
        expect(extendedNodes).toHaveLength(3);
    });
});