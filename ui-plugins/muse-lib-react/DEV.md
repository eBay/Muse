## Sub App Implementation details

Under `src/features/sub-app`:

- route.js: find all sub apps registerted under `pluginInstance.subApps`, and then register paths
- SubAppContainer: On every update, detect if url is changed and matches some sub app. Then load the sub app in an iframe.