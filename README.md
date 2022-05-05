# muse-next
Next generation of Muse.

## Overview
This is a monorepo to host all Muse code.

- examples: Sample plugin projects to test Muse build system and dev time setup.
- packages: all Muse packages.

## Dev Guide

First, run `yarn` to install dependencies under folders of `examples` and `packages`.

1. Execute `yarn link` under below folder in `packages`:
- muse-craco-plugin
- muse-webpack-plugin
- muse-scripts-react

2. Under `pakcages/muse-craco-plugin`:
`yarn link muse-webpack-plugin`

3. Under examples projects, link `muse-craco-plugin`:
`yarn link muse-craco-plugin`

4. Execute `yarn link` under library plugins in `examples/muse-react` and `examples/muse-antd`.

5. Link library plugins for dependent plugins:
- under `examples/muse-antd`: `yarn link muse-react`
- under `examples/muse-layout`: `yarn link muse-react` and `yarn link muse-antd`.

Then you are able to run `yarn start`, `yarn build`, `yarn build:dev` under examples projects.

To load the Muse app, there is a temp `packages/muse-dev-server` project, run `yarn start` and modify `lib/index.html` to adjust the plugins and bundles of plugins.

## License
MIT
