import globals from 'globals';
import pluginJs from '@eslint/js';
import mochaPlugin from 'eslint-plugin-mocha';

export default [
  { languageOptions: { globals: globals.node } },
  mochaPlugin.configs.flat.recommended,
  pluginJs.configs.recommended,
];
