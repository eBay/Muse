/**
 * @module muse-core/storage
 */
module.exports = {
  /** @member {object<Storage>} cache */
  cache: require('./cache'),
  /** @member {object<Storage>} assets */
  assets: require('./assets'),
  /** @member {object<Storage>} registry */
  registry: require('./registry'),
  /** @member {class} FileStorage */
  FileStorage: require('./FileStorage'),
  /** @member {class} Storage */
  Storage: require('./Storage'),
};
