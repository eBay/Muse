import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs-extra';
import findRoot from 'find-root';
import { findMuseModule } from '@ebay/muse-modules';

// import musePlugin from './muse-vite-plugin';

const pkgMap = {};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\\.*\.js$/ }, async args => ({
              loader: 'jsx',
              contents: await fs.readFile(args.path, 'utf8'),
            }));
          },
        },
        {
          name: 'musetest',
          setup(build) {
            const allContent = {};
            ['@ebay/muse-lib-react', '@ebay/muse-lib-antd'].forEach(libName => {
              Object.assign(
                allContent,
                fs.readJsonSync(require.resolve(libName + '/build/dev/lib-manifest.json')).content,
              );
            });
            // console.log(allContent);

            // const libs = ['react/index.js', 'js-plugin/plugin.js'];
            console.log('setup esbuild');
            // Load ".txt" files and return an array of words
            build.onLoad({ filter: /\.js$/ }, async args => {
              const rootPkgPath = findRoot(args.path);
              if (!rootPkgPath) return;
              const rootPkg = fs.readJsonSync(rootPkgPath + '/package.json');
              if (!rootPkg.name || !rootPkg.version) return;
              const museModuleId = `${rootPkg.name}@${rootPkg.version}${args.path.replace(
                rootPkgPath,
                '',
              )}`;
              // console.log(museModuleId);
              const museModule = findMuseModule(museModuleId, { modules: allContent });
              // console.log('museModule:', museModule);
              if (museModule) {
                return {
                  contents: `const m = MUSE_GLOBAL.__shared__.require("${museModuleId}"); module.exports=m ? (m.default || m): null;`,
                };
              }

              // // console.log(rootPkg);
              // if (args.path.includes('classnames')) console.log(args);
              // if (args.path.includes('js-plugin')) console.log(args);
              // const found = libs.find(name => args.path.includes(name));
              // if (found) {
              //   console.log('on load', args);
              //   const arr = found.split('/');
              //   arr[0] = arr[0] + '@1.0.0';
              //   const mid = arr.join('/');
              //   return {
              //     contents: `module.exports=MUSE_GLOBAL.__shared__.require("${mid}")`,
              //   };
              // }
            });
          },
        },
      ],
    },
    extensions: null,
  },
});
