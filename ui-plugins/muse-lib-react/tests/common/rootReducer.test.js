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
            reducer: (state = { init: false }, action = { type: "init" }) => {return { init: true }},
            reducers: {
                demoplugin: (state = { user: false }, action = { type: "demoplugin" }) => { return { user: true }},
                modals: (state = { }, action = { type: "nice-modal/remove" }) => { return { }},
                home: (state = { }, action = { type: "home" }) => { return { }},
                common: (state = { }, action = { type: "common" }) => { return { }},
                subApp: (state = { }, action = { type: "sub-app" }) => { return { }},
            },
        });

        plugin.register({
            name: 'myplugin2',
            reducer: (state = { done: false }, action = { type: "done" }) => { return { done: true }},
        });

        const combinedReducersFn = rootReducer();
        const combinedReducers = combinedReducersFn();
        expect(Object.keys(combinedReducers).find(cr => cr === "pluginMyplugin")).toBeTruthy();
        expect(Object.keys(combinedReducers).find(cr => cr === "pluginMyplugin2")).toBeTruthy();
        expect(Object.keys(combinedReducers).find(cr => cr === "demoplugin")).toBeTruthy();
        expect(combinedReducers["demoplugin"].user).toBeTruthy();
    });
});