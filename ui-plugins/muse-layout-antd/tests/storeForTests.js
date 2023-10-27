import configStore from './configStoreForTests';

export default {
  store: null,
  getStore(initialState) {
    if (!this.store) this.store = configStore(initialState);
    return this.store;
  },
  resetStore() {
    this.store = null;
  },
  getState() {
    return this.getStore().getState();
  },
  dispatch(action) {
    return this.getStore().dispatch(action);
  },
  subscribe(listener) {
    return this.getStore().subscribe(listener);
  },
  replaceReducer(reducer) {
    return this.getStore().replaceReducer(reducer);
  },
};
