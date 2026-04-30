# Generate info.json For Build

During build, it generates info.json for the build, save it to output dir. Which includes:

- name: name in package.json
- pluginType: the muse.type in package.json
- deps: find all dependending muse lib plugins -- using muse-dev-utils getMuseLibs() function, array of { name, version }
- branch: the current branch name for build
- sha: the current head sha for build
- repo: the repository url in package.json
- size: the bundle size after gzip, has below parts
  - main: the main.js size
  - chunks: total size of all chunks
  - media: total size in assets folder
- buildTime: how long it takes to finish build, in `ms`
- esModule: set esModule to true if type=module in package.json, otherwise false
- ut: if /coverage/cobertura-coverage.xml exists, extract line covrage data here. If not exists, don't set this property.

Implementation:

- use a seprate rolldown plugin to generate it: infoJsonRolldownPlugin.js
- include it in museVitePlugin

