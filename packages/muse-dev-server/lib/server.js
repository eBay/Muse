const fs = require('fs-extra');
const _ = require('lodash');
const express = require('express');
const app = express();
const port = 6070;

app.use('/p/ebay.muse-react/v1.0.0', express.static('../../examples/muse-react/build'));
app.use('/p/ebay.muse-antd/v1.0.0', express.static('../../examples/muse-antd/build'));
app.use('/p/ebay.muse-boot/v1.0.0', express.static('../../examples/muse-boot/build'));
app.use('/p/muse-layout/v1.0.0', express.static('../../examples/muse-layout/build'));

app.get('/', (req, res) => {
  res.send(_.template(fs.readFileSync('./lib/index.html'), { interpolate: /<%=([\s\S]+?)%>/g })({}));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
