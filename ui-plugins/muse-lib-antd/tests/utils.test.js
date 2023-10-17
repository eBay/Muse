import { extendArray, extendFormMeta } from '../src/utils';
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

    it('extendFormMeta', () => {

        plugin.register({
            name: 'demo',
            muse: {
                configureMeta : {
                    preProcessMeta: () => {},
                    getFields: () => { return [{ key: 'payload.pluginDesc', label: 'Plugin desc'}]},
                    processMeta: () => {},
                    postProcessMeta: () => {},
                },
            }
          });

        const meta = { fields: [{ key: 'payload.pluginName', label: 'Plugin name' }] };
        extendFormMeta(meta, 'muse.configureMeta', { });
        expect(meta.fields).toHaveLength(2);
    });
});