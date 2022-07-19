/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

'use strict';

const Dependency = require('webpack/lib/Dependency');
const makeSerializable = require('webpack/lib/util/makeSerializable');

class MuseEntryDependency extends Dependency {
  constructor(dependencies, name) {
    super();

    this.dependencies = dependencies;
    this.name = name;
  }

  get type() {
    return 'muse entry';
  }

  serialize(context) {
    const { write } = context;

    write(this.dependencies);
    write(this.name);

    super.serialize(context);
  }

  deserialize(context) {
    const { read } = context;

    this.dependencies = read();
    this.name = read();

    super.deserialize(context);
  }
}

makeSerializable(MuseEntryDependency, 'webpack/lib/dependencies/MuseEntryDependency');

module.exports = MuseEntryDependency;
