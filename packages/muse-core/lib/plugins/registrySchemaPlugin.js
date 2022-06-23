const _ = require('lodash');
const Ajv = require('ajv');
const yaml = require('js-yaml');
const { parseRegistryKey } = require('../utils');
const appSchema = require('../schemas/app.json');
const pluginSchema = require('../schemas/plugin.json');
const deployedPluginSchema = require('../schemas/deployedPlugin.json');
const releasesSchema = require('../schemas/releases.json');
const logger = require('../logger').createLogger('museCore.plugins.registrySchemaPlugin');
/**
 * Validate schema for all data saved to registry
 * @returns plugin instance
 */
module.exports = () => {
  const ajv = new Ajv();
  ajv.addSchema(appSchema, 'app');
  ajv.addSchema(pluginSchema, 'plugin');
  ajv.addSchema(deployedPluginSchema, 'deployed-plugin');
  ajv.addSchema(releasesSchema, 'releases');

  return {
    name: 'registrySchemaPlugin',
    museCore: {
      registry: {
        storage: {
          beforeSet: async (ctx, key, value) => {
            // validate schema before really save value to the registry
            const item = parseRegistryKey(key);
            logger.verbose(`Validating schema for ${key}`);
            if (!item) {
              logger.warn(`Unknown registry key pattern: ${key}.`);
              return;
            }

            const json = yaml.load(value.toString());
            const validate = ajv.getSchema(item.type);
            if (!validate) {
              logger.warn(`Unknonwn registry item type: ${item.type} for key: ${key}`);
              return;
            }
            if (!validate(json)) {
              throw new Error(JSON.stringify(validate.errors, null, 2));
            }
            logger.verbose(`Succeeded to validate schema for ${key}`);
          },
        },
      },
    },
  };
};
