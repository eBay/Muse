import { extendArray } from '../../../src/features/common/utils';
import plugin from 'js-plugin';

describe('utils.js', () => {

    beforeEach(() => {
        if (plugin.getPlugin('demo')) { plugin.unregister('demo') };
    });

    it('extendArray', () => {

        plugin.register({
            name: 'demo',
            muse: {
                configureNumbers : {
                    preProcessNumbers: () => {},
                    getNumbers: () => [2],
                    processNumbers: () => {},
                    postProcessNumbers: () => {},
                },
            }
          });

        const numbers = [1];
        extendArray(numbers, 'numbers', 'muse.configureNumbers', { });
        expect(numbers).toHaveLength(2);
    });
});