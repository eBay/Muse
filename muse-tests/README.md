# muse-eco-e2e-test

Smoking test for the whole Muse system.

## Included Testing Steps

- Setup env to include all necessary packages.
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


## Extend e2e tests
Allow to load other plugins/scripts for extending the scope of e2e testing.

## Usage
1. Make changes
2. Run `docker build -t muse-tests .` to build the image
3. Start container in terminal `docker run muse-tests`

## Templates
The `templates` folder is used to host template files for plugin or app code of Muse.