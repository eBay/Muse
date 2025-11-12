# muse-ci-tools

This project provide tools and tests to deliver Muse packages, including Muse UI plugins and npm packages.

- Tools set for publish Muse packages.
- Extensible integration tests architecture.

## Local Development
To write e2e tests and run them locally, we use a local docker container to run full tests to provide a clean environment. The flow is a little different from which runs by Github actions.

To optimize the performance, mount the folder `tmp` to persist muse repo and verdaccio storage. See the code in `scripts/runTests.js`.

To start this flow, run below command:

```
pnpm docker:run
```

It runs `scripts/runTestsLocally.js` actually.


> NOTE: never run `src/index.js` directly at local since it modifies souce code of the repo.

> If there's problem to run tests, try remove `tmp` folder then try again. (the `tmp` folder is used to persist pnpm store, npm store and muse-repo between tests)

## NPM Scripts Explaination

- `"docker:run": "node ./scripts/runTestsLocally.js"` : only for local testing, start a docker container to setup Muse environment and run tests.
- `"docker:demo":""`: run Muse for demo in a clean environment, install all deps from public npm registry. Then it could be accessed locally with exported ports.
- `"test": "node src/index.js"` : start the testing, it runs `src/index.js` . This should always be run in a contaner (both local docker or Github actions server)
- `"test:local": "pnpm i && pnpm test"` : only called in local docker container, it installs dependency first and then run tests. Usually not called directly.
- `"start-local-registry": "node ./scripts/startLocalRegistry.js"`: start local npm server for testing using the mounted tmp folder.

## Testing Steps

- Setup env to include all necessary packages.
  - Clone all Muse source code from given repo/branch
  - Install all deps
  - Run unit tests under each workspace package
  - Publish all packages under workspace to a local folder
    - Use `pnpm pack` to get tgz files
    - Define pnpm resolutions to map packages to tgz files (maybe need to extract)
  - Build and publish all UI plugins to a local folder
    - Standard plugins
      - @ebay/muse-boot-default
      - @ebay/muse-lib-react
      - @ebay/muse-lib-antd
      - @ebay/muse-layout-antd
    - Run `pnpm build`
    - Run `pnpm publish` for each ui-plugin
    - Define pnpm resolutions to map packages to tgz files (maybe need to extract)
  - The step should be able to be skipped to test all published packages

- Main Test FLow
  - Create an app
  - Create an env
  - Deploy core plugins: boot, lib-react
  - Deploy core plugins: antd, layout-antd
  - Create a lib plugin
  - Build the lib plugin
  - Publish the lib plugin
  - Create a normal plugin
  - Create a init plugin
  - Create a boot plugin
  - Build plugins
  - Deploy plugins
  - Undeploy plugins

- E2E Tests
  - App management
    - Create an app
      - Run `muse serve app`, should throw env not found exception (the default env is staging)
    - Create an env on the app
      - Run `muse serve app@staging`
      - Verify `index.html` should throw error no boot plugin
    - Create another env
    - Update app
    - Update env

- Test very basic flow
  - Create an app
  - Deploy pure muse-boot-default + muse-lib-react plugin
  - Verify that the basic app works
  - Deploy muse-lib-antd, muse-layout-antd plugin
  - Verify antd and layout plugins work
- Verify the demo app works
  - Create a new Muse app
  - Git clone examples folder from muse-next
  - Create plugins for example plugins
  - Build example plugins
  - Deploy example plugins
  - Verify example app works
- Muse Manager (with app/api/assets middleware) works
  - Start muse manager
  - Create app
  - App list
  - Plugin list
- Environments works
  - Create a new env forking from staging on demo app
  - Verify the new env works
  - Delete the env
  - Verify the env doesn't work
- Create muse app
- Create muse plugin
- Build plugin: dev, dist. (all plugins from example folder)
  - Git clone examples folder from muse-next
  - Build plugins of all demo plugins
- Deploy plugin
- Verify the deployed plugin is working
- Install a remote plugin
- Test git storage: create a local git repo for testing (inited by default file storage)
- Test s3 storage
- Test core plugins: create a core plugin and it works on cli and api
- Test express middlewares: api, app, assets
- Test acl plugin

### Env Variables

- MUSE_MONO_REPO

## Extend e2e tests
Allow to load other plugins/scripts for extending the scope of e2e testing.

## Usage
1. Make changes
2. Run `docker build -t muse-tests .` to build the image
3. Start container in terminal `docker run muse-tests`

## Templates
The `templates` folder is used to host template files for plugin or app code of Muse.