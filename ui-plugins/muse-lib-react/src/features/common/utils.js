import jsPlugin from 'js-plugin';
import _ from 'lodash';

/**
 * @description Make an array extensible by js plugins.
 * @param {*} arr
 * @param {*} extName
 * @param {*} extBase
 * @param  {...any} args
 */
export const extendArray = (arr, extName, extBase, ...args) => {
  const capitalName = extName.charAt(0).toUpperCase() + extName.slice(1);
  jsPlugin.invoke(`${extBase}.preProcess${capitalName}`, ...args);
  const items = _.flatten(jsPlugin.invoke(`${extBase}.get${capitalName}`, ...args));
  arr.push(...items);
  jsPlugin.invoke(`${extBase}.process${capitalName}`, ...args);
  jsPlugin.invoke(`${extBase}.postProcess${capitalName}`, ...args);
  jsPlugin.sort(arr);
  return arr;
};
