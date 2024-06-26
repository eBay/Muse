import simpleGit from 'simple-git';
import _ from 'lodash';
import fs from 'fs-extra';
import chokidar from 'chokidar';

const gitDirMap = {};
const watcherMap = {};
const gitStatusMap = {};

const getGitDir = (dir) => {
  if (gitDirMap[dir]) return gitDirMap[dir];
  // find the nearest git dir
  const git = simpleGit(dir);
  return git.revparse(['--show-toplevel']).then((gitDir) => {
    gitDirMap[dir] = gitDir;
    return gitDir;
  });
};

const gitMap = {};
const getGitClient = (dir) => {
  if (gitMap[dir]) return gitMap[dir];
  gitMap[dir] = simpleGit(dir);
  return gitMap[dir];
};

// watch git status of all plugins
// TODO: remove watcher if a folder is removed.
export default ({ app, io, config }) => {
  const callbacks = {};
  const handleGitChange = (gitDir) => {
    if (callbacks[gitDir]) return callbacks[gitDir];
    callbacks[gitDir] = _.debounce(async () => {
      const git = getGitClient(gitDir);
      const status = await git.status();
      _.invertBy(gitDirMap)[gitDir]?.forEach((d) => {
        gitStatusMap[d] = status;
      });

      io.emit({
        type: 'git-status-changed',
        data: gitStatusMap,
      });
    }, 300);
    return callbacks[gitDir];
  };

  const handleConfigChange = async () => {
    const plugins = config.get('plugins', {});

    for (let dir of Object.values(plugins).map((p) => p.dir)) {
      if (!fs.existsSync(dir)) continue;
      try {
        const gitDir = await getGitDir(dir);
        if (!watcherMap[gitDir]) {
          watcherMap[gitDir] = chokidar.watch(gitDir, { ignored: /node_modules/ });
          watcherMap[gitDir].on('all', handleGitChange(gitDir));
          handleGitChange(gitDir)();
        }
      } catch (e) {
        // ignore
        console.log('failed to watch git dir: ' + dir, e.message);
      }
    }
  };

  config.onDidChange('plugins', handleConfigChange);

  handleConfigChange();
  app.get('/api/git-status', (req, res) => {
    res.end(JSON.stringify(gitStatusMap));
    // const dir = decodeURIComponent(req.query.dir);
    // const git = simpleGit(dir);
    // git.status((err, result) => {
    //   if (err) {
    //     res.end({
    //       code: 1,
    //       msg: err,
    //     });
    //   } else {
    //     res.end({
    //       code: 0,
    //       data: result,
    //     });
    //   }
    // });
  });
};
