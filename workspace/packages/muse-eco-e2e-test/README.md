# muse-eco-e2e-test

E2e testing the Muse ecosystem.

## Included Testing Steps

- Setup env to include all necessary packages.
- Create muse app
- Create muse plugin
- Build plugin: dev, dist.
- Deploy plugin
- Verify the deployed plugin is working
- Install a remote plugin
- Test git storage: create a local git repo for testing
- Test s3 storage
- Test core plugins: create a core plugin and it works on cli and api
- Test express middlewares: api, app, assets


## Extend e2e tests
Allow to load other plugins/scripts for extending the scope of e2e testing.