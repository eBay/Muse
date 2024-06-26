import utils, { handleAsyncError } from '../utils.js';

export default ({ runner }) =>
  handleAsyncError(async (req, res) => {
    const { dir } = req.body;
    await runner.stopPlugin({ dir });
    res.end('ok');
  });
