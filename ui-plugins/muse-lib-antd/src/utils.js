import jsPlugin from 'js-plugin';
import _ from 'lodash';

/**
 * @description Make a nice-form-react meta extensible by js plugins.
 * @param {*} meta
 * @param {*} extBase
 * @param  {...any} args
 * @returns
 */
export const extendFormMeta = (meta, extBase, ...args) => {
  jsPlugin.invoke(`${extBase}.preProcessMeta`, ...args);
  const fields = _.flatten(jsPlugin.invoke(`${extBase}.getFields`, ...args)).filter(Boolean);
  meta.fields.push(...fields);
  jsPlugin.invoke(`${extBase}.processMeta`, ...args);
  jsPlugin.invoke(`${extBase}.postProcessMeta`, ...args);
  jsPlugin.sort(meta.fields);

  return {
    watchingFields: _.flatten(jsPlugin.invoke(`${extBase}.getWatchingFields`, ...args)),
    meta,
  };
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @description Make an array extensible by js plugins.
 * @param {*} arr
 * @param {*} extName
 * @param {*} extBase
 * @param  {...any} args
 */
export const extendArray = (arr, extName, extBase, ...args) => {
  const capitalName = capitalizeFirstLetter(extName);
  jsPlugin.invoke(`${extBase}.preProcess${capitalName}`, ...args);
  const items = _.flatten(jsPlugin.invoke(`${extBase}.get${capitalName}`, ...args));
  arr.push(...items);
  jsPlugin.invoke(`${extBase}.process${capitalName}`, ...args);
  jsPlugin.invoke(`${extBase}.postProcess${capitalName}`, ...args);
  jsPlugin.sort(arr);
  return arr;
};

export default { extendArray, extendFormMeta };
