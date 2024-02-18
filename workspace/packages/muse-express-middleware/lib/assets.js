const path = require('path');
const muse = require('@ebay/muse-core');
const mimeTypes = require('mime-types');

module.exports = (options) => async (req, res, next) => {
  const { basePath = '/muse-assets' } = options;
  if (!req?.originalUrl?.startsWith(basePath)) return next();

  const assetKeyPath = req.originalUrl.replace(basePath, '');

  try {
    const result = await muse.storage.assets.get(decodeURIComponent(assetKeyPath));
    if (!result) {
      res.statusCode = 404;
      res.write(`Muse asset not found: ${assetKeyPath}.`);
      res.end();
      return;
    }

    res.setHeader(
      'Content-Type',
      mimeTypes.contentType(path.extname(assetKeyPath)) || 'text/plain',
    );
    res.write(result);
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.write(err.message);
    res.end();
  }
};
