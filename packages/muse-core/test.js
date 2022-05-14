(async () => {
  const { globby } = await import('globby');
  console.log(await globby(process.cwd() + '/lib/*'));
})();
