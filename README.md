# muse-next
Next generation of Muse.

## Overview
This is a monorepo to host all Muse code.

- examples: Sample plugin projects to test Muse build system and dev time setup.
- packages: all Muse packages.

## Dev Guide

1. Run `yarn` to install dependencies under folders of `examples` and `packages`.
2. Run `npm link` under `packages/muse-cli` to enable the global `muse` command.
3. Create a Muse app in the local registry: `muse create-app app1`
4. Create a new staging env on app1: `muse create-env app1 staging`
5. Create muse plugin in the local registry for projects under `/examples`:
   - Create plugin `muse create @ebay/muse-react`
   - Build plugin: run `yarn build` and `yarn build:dev` under example projects
   - Release plugin: run `muse release @ebay/muse-react` under example projects (use correct plugin name)
   - Deploy plugin on `app1/staging`: `muse deploy app1 staging @ebay/muse-react`. This deploy the latest version of plugin on the app.
6. Go to `packages/muse-web` and run `yarn start` to start the Muse sample app server.

Then you should able to access http://localhost:6070 to see the Muse app locally.

> NOTE: whenever some packages missing when run above commands. Plz `yarn link` the missing ones.

To start a example local project, you can use `yarn start` just like the current Muse behavior. And it also supports `MUSE_LOCAL_PLUGINS` in the `.env` file.

For the full Muse CLI commands, please see: https://github.corp.ebay.com/muse/muse-next/tree/main/packages/muse-cli .

## License
MIT
