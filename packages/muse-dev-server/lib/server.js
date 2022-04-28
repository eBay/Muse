const fs = require('fs-extra');
const _ = require('lodash');
const express = require('express');
const app = express();
const port = 6070;

app.use('/p/muse-react', express.static('../../examples/muse-react/build'));
app.use('/p/muse-antd', express.static('../../examples/muse-antd/build'));
app.use('/p/muse-layout', express.static('../../examples/muse-layout/build'));

app.get('/', (req, res) => {
  res.send(_.template(fs.readFileSync('./lib/index.html'), { interpolate: /<%=([\s\S]+?)%>/g })({}));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
