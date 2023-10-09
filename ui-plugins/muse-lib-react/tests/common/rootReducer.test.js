import rootReducer from '../../src/common/rootReducer';
import plugin from 'js-plugin';

describe('rootReducer', () => {

    beforeEach(() => {
        if (plugin.getPlugin('myplugin')) { plugin.unregister('myplugin') };
        if (plugin.getPlugin('myplugin2')) { plugin.unregister('myplugin2') };
      });

    it('default test', () => {

        plugin.register({
            name: 'myplugin',
            reducer: (state = { init: false }, action) => { init: true },
            reducers: {
                user: () => {},
            },
        });

        plugin.register({
            name: 'myplugin2',
            reducer: (state = { done: false }, action) => { done: true },
        });

        const combinedReducers = rootReducer();
        expect(combinedReducers).toBeTruthy();
    });
});