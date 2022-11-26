# @ebay/muse-boot-default


Muse boot is a special plugin that is used to bootstrap a Muse application in the browser side, it mainly does below things:

- Provide a shared modules container.
- Register service worker to cache plugin resources (if not disabled).
- Load other plugins
- Execute initialization logic from plugins
- Define some global methods on `window.MUSE_GLOBAL`.
- Find and execute app entry to start the app.


## MUSE_GLOBAL APIs
It provides various APIs on `MUSE_GLOBAL` for other plugins to use.

### appEntries
An app entry is used to start the whole application. For React, a typical entry is like below:

### error
### getAppVariable
### getAppVariables
### getPluginVariable
### getPluginVariables
### getPublicPath
### getUser
### initEntries
### loading
### msgEngine
### waitFor
### \__shared__



When open a Muse app, the server responds the current configuration of the app in window.MUSE_CONFIG variable, then muse-boot uses the config to bootstrap the application. It also means you can write your own boot plugin by the information in `MUSE_CONFIG`.

## Summary
For any boot plugin , it must implement the APIs mentioned above. So that all plugins are able to be loaded by any boot plugin.