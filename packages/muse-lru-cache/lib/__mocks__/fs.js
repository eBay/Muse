const { fs } = require('memfs');

// Fix warning
if (!fs.realpath) fs.realpath = {};
fs.realpath.native = () => {};
module.exports = fs;
