# Get Started

This is a 20 minutes tutorial to go through the Muse development and deployment process. It helps you to understand core concepts of Muse. Although we use React to go through the tutorial, after you understand how everything works in React, you can also use other UI frameworks with Muse.

## Installation
Muse provides command line tools to manage Muse applications and plugins.

### 1. Install Muse command line tools
```bash
npm install -g muse-cli
```
Then you have `muse` command to manage all apps and plugins. You can run `muse -h` to see all the available commands.

### 2. Initialize the Muse system.
Run the `muse init` to initialize the Muse system locally. It mainly installs some reusable plugins provided by Muse team. And it creates Muse manager console at local
  - @ebay/muse-boot-default
  - @ebay/muse-lib-react
  - @ebay/muse-lib-antd
  - @ebay/muse-layout-antd
  - @ebay/muse-manager
  - Create app musemanager and env production
  - Deploy plugins to musemanager

However, if you are familiar with Muse system enough, this step is not a must.

### 3. Try the Muse manager
Run `muse manager`, then you can access http://localhost:6060 . From the muse manager console, you can create app/plugin and deploy plugins to applications.

:::tip

muse manager is also a normal Muse application. You can see it in the app list from muse manager. While there’s any update of muse manager, you just need to upgrade the plugin version deployed on the app.

:::