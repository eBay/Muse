const express = require('express');
const museAssetsMiddleware = require('muse-express-middleware/lib/assetsMiddleware');
const app = express();
const port = 6070;

app.use(museAssetsMiddleware({}));
app.get('/*', require('./indexPage'));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
