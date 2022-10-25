# Why Muse?

Muse has been used inside eBay for years and is serving hundreds of internal UI consoles. It has been approved to be stable and scalable. The idea of Muse was generated based on our experiences on building large web applications. Below is the list of advantages Muse brings to us.

## Reduced complexity
First, what is complexity? Instead of defining complexity by how easy to add a new feature, we think it should be how easy to remove an existing feature. In Muse, every feature could be an independent plugin. At the same time, all features/plugins of an application can work together seamlessly, which means it’s just like you write all code in a single project. In Muse, every feature could be a plugin which could be easily added, removed or moved from one app to another. By this approach, your applications will always keep simple to be understood and maintained.

## Great dev experience
There is no difference between developing a Muse plugin and a normal frontend project. With micro frontends, you usually work on multiple projects at the same time, it’s then a challenge to debug between projects. For example, you added an extension point in one plugin,then want to use it in another plugin. Muse provides very convenient mechanisms for you working on multiple projects at the same time:
Allows to load remote plugins when you develop a local plugin
Allows to compile multiple plugins’ source code together in one webpack dev server. So you feel like you are working on a single project.
Every plugin could have a dev build bundle, so all dev time mechanisms like React props validation, redux-logger are kept for all plugins at dev time even some are loaded remotely.
Fast compilation
Many tools like esbuild, rollup, vite, etc were invented to improve the build performance. But in Muse’s philosophy, a huge project is the root cause of the slow build time, not due to a tool. Muse can significantly reduce the build time because:
Muse plugins are usually very small (several KBs after gzip). It’s super fast to compile for both dev and build time.
Shared modules don’t need to be compiled again. After you create some library plugins, other plugins never need to re-compile modules from those plugins again.

## “Good” code and “bad” code works together well

There are always senior and junior members in a team. Even you and yourself six months ago, are different members. They write different levels/styles of code, which looks “good” or “bad” by different people, even the same people at different times. The collaboration of constructing an understandable large project is difficult. But when a project is small enough, everything is not a problem, even if you name variables with a, b, c. In Muse, different people own different features, they choose different patterns, tools and styles they are used to. Muse allows every feature to be a small project.

## High load performance
Muse manages releases by versions. Every version is immutable, it means we can permanently cache a plugin bundle in the browser side. Muse provides the service worker to cache the plugin bundle by default. Another benefit is, when a new plugin version is deployed, only the new version needs to be loaded again.
