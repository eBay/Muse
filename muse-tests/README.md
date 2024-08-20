# muse-tests

Full end-to-end tests for the whole Muse system.

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