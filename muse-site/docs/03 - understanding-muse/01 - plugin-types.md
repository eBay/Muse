# Plugin Types

Every Muse plugin is a normal js bundle loaded via a `<script>` tag in the page. There are 4 types: `boot`, `init`, `lib` and `normal`. They have different purposes:

- **boot plugin**: there is only one `boot` plugin on each app. Though we call it a "plugin" actually it's just a normal javascript code used to do some initialization of Muse app and load other plugins.
- **init plugin**: technically a `init` plugin is also normal javascript code same with `boot` plugin. It's used to do some custom initialization before starting the app. For example, check authentication, setup google analytics, etc. You can put all initialization logic in one `init` plugin or multiple ones.
- **normal plugin**: it's where you implement main business logics. We suggest we create one plugin for one feature, so normally you have multiple `normal` plugins.
- **lib plugin**: a `lib` plugin can also be used as `normal` plugin but it can provide shared modules at run time. By default, all modules used by a `lib` plugin are able to be shared to other plugins, including other `lib` plugins.

Below picture shows the overview plugin Muse plugin types:

<img src={require("/img/plugin-types.png").default} width="500" />

When you open a Muse app, the `boot` plugin is first loaded, then it loads init plugins in parallel. After that, it loads `lib` and `normal` plugins in parallel.

At run time, `normal` and `lib` plugins can register plugin instance to the plugin engine (js-plugin). `lib` plugin provides shared modules.

:::note
`boot` and `init` plugins don't use shared modules, so they should usually have very few or no dependencies to be small.
:::note

## Execution flow
Different types of plugins have different execution mechanism:

For boot and init plugin, they are executed while loaded. But `init` plugins could register executors which are executed after all `init` plugins are loaded.

For `lib` and `normal` plugins, they are not executed while loaded in parallel, then:
1. Execute all `lib` plugins bundles, so that all shared modules are provided
2. Execute all `normal` plugins bundles.

At last, the app execute the app entry:

- If not specified app entry and only one app entry registered, it's executed.
- If specifed app entry exists then excute it otherwise throws error.