module.exports = ({
  jestConfig,
  cracoConfig,
  pluginOptions,
  context: { env, paths, resolve, rootDir },
}) => {
  console.log(JSON.stringify(jestConfig, null, 4));

  // Always return the config object.
  return jestConfig;
};
