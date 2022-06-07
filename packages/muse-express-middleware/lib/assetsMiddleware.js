const path = require('path');
const muse = require('muse-core');
const mimeTypes = require('mime-types');

module.exports = (options) => async (req, res, next) => {
  const { basePath = '/muse-assets' } = options;
  if (!req.path.startsWith(basePath)) return next();

  const assetKeyPath = req.path.replace(basePath, '');

  const result = await muse.storage.assets.get(decodeURIComponent(assetKeyPath));
  if (!result) {
    res.status(404);
    res.write(`Muse asset not found: ${assetKeyPath}.`);
    res.end();
    return;
  }

  res.setHeader('Content-Type', mimeTypes.contentType(path.extname(assetKeyPath)) || 'text/plain');
  res.write(result);
  res.end();
};
