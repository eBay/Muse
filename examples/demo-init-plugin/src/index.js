const { initEntries, plugins } = window.MUSE_GLOBAL;

initEntries.push({
  name: 'demo-init-plugin',
  func: () => {
    const s = window.sessionStorage.getItem('muse-demo:excluded-plugins');
    if (!s) return;
    try {
      const excludedPlugins = JSON.parse(s);
      while (excludedPlugins.length > 0) {
        const name = excludedPlugins.pop();
        console.log(' * Excluded plugin: ' + name);
        const i = plugins.findIndex(p => p.name === name);
        if (i >= 0) {
          plugins.splice(i, 1);
        }
      }
    } catch (err) {
      console.log('Failed to process excluded plugins.');
    }
  },
});