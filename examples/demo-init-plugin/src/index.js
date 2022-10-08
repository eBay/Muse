const { initEntries, plugins } = window.MUSE_GLOBAL;

initEntries.push({
  name: 'demo-init-plugin',
  func: () => {
    console.log('executed', plugins);
    const s = window.localStorage.getItem('muse-demo:excluded-plugins');
    if (!s) return;
    try {
      const excludedPlugins = JSON.parse(s);
      while (excludedPlugins.length > 0) {
        const name = excludedPlugins.pop();
        console.log(' * Excluded plugin: ' + name);
        const i = plugins.findIndex(p => p.name === name);
        plugins.splice(i, 1);
      }
    } catch (err) {
      console.log('Failed to process excluded plugins.');
    }
  },
});
