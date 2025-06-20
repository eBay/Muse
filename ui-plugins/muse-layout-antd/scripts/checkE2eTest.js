try {
  console.log(require.resolve('altus-ui-e2e-test'));
} catch (e) {
  console.error('Altus UI e2e test framework not found, please go to https://go/altus-ui for guide about how to install it.');
  process.exit(1);
}
