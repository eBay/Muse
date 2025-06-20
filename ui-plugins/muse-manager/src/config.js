import jsPlugin from 'js-plugin';

const config = {
  defaultValues: {
    pluginListDefaultScope: 'all',
    pluginListDefaultEnv: 'all',
    appListDefaultScope: 'all',
  },
  __initialized: false,
  ensureInit() {
    if (this.__initialized) return;
    const setConfig = (values) => Object.assign(this.defaultValues, values);
    jsPlugin.invoke('museManager.setConfig', setConfig);
    this.__initialized = true;
  },
  get(key) {
    this.ensureInit();
    return this.defaultValues[key];
  },
};
export default config;
