# README

@ebay/muse-lib-react is a lib plugin with a combination of popular React tech stacks like:

- [React Router](https://reactrouter.com/en/main)
- [Redux](https://redux.js.org/)
- [React Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [lodash](https://lodash.com/)
- [Nice Modal](https://github.com/ebay/nice-modal-react)

As a library plugin, above packages are already included in the plugin bundle as shared modules which can be re-used by other plugins depending on it.

It not only setups these libs but also being responsible to start the whole application with `React.createRoot().render()`.

Also, the muse-lib-react plugin provides flexible extension points for extending/customizing the application behaviors, like extending routing rules, redux store, etc.

> It's not must to use this plugin in your app, you can create your own react lib plugin to include your own favorite libraries and setup.


