// Deploy to one local folder
// For example:
//   node scripts/deploy.js ../app

const fs = require('fs-extra');
const path = require('path');

let target = process.argv[2];
if (!target) {
  console.error('Error: target folder not provided.');
}

if (!path.isAbsolute(target)) {
  target = path.join(process.cwd(), target);
}

console.log('Deploy to: ', target);
console.log(path.join(target, 'node_modules/@ebay/muse-lib-react'));
fs.copySync(
  path.join(__dirname, '../build'),
  path.join(target, 'node_modules/@ebay/muse-lib-react/build'),
);
// // fs.copySync(path.join(__dirname, '../build/apm.js'), path.join(target, 'node_modules/muse-boot/build/apm.js'))

console.log('Deploy success.');
