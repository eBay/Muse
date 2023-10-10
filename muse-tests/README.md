# muse-eco-e2e-test

E2e testing the whole Muse system.

## Included Testing Steps

- Setup env to include all necessary packages.
- Create muse app
- Create muse plugin
- Build plugin: dev, dist. (all plugins from example folder)
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