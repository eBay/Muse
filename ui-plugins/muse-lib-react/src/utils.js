import jsPlugin from 'js-plugin';
import _ from 'lodash';

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
  jsPlugin.invoke(`${extBase}.preProcess${capitalName}`, arr, ...args);
  const items = _.flatten(jsPlugin.invoke(`${extBase}.get${capitalName}`, ...args));
  arr.push(...items);
  jsPlugin.invoke(`${extBase}.process${capitalName}`, arr, ...args);
  jsPlugin.invoke(`${extBase}.postProcess${capitalName}`, arr, ...args);
  jsPlugin.sort(arr);
  return arr;
};

export default { extendArray };
