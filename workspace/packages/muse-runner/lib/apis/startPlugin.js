import { handleAsyncError } from '../utils.js';

export default ({ config, runner }) =>
  handleAsyncError(async (req, res) => {
    const { pluginName } = req.body;
    const plugins = config.get('plugins', {});
    const dir = plugins[pluginName]?.dir;
    if (!dir) throw new Error(`Plugin folder not found: ${pluginName}`);

    const pluginRunner = await runner.startPlugin({
      dir,
      plugin: plugins[pluginName],
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(
      JSON.stringify({
        ...pluginRunner.pluginInfo,
        port: pluginRunner.port,
      }),
    );
  });
