const reporter = {
  // eslint-disable-next-line no-unused-vars
  suites: [],
  addResult(suite) {
    if (!suite || !suite.title) return;
    this.suites.push(suite);
  },
  report() {
    console.log('Testing summary: ');
    this.suites.forEach((s) => {
      console.log('  - ', s.title, `(${s.tests?.length} tests)`);
      s.tests?.forEach((t) => {
        console.log('    - ', t.title);
      });
    });
  },
};
export default reporter;
