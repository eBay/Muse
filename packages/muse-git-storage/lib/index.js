const GitStorage = require("./GitStorage");

module.exports = ({ url, organizationName, projectName, token }) => ({
  name: 'muse-git-storage',
  museCore: {
    registry: {
      storage: new GitStorage({
        url,
        organizationName,
        projectName,
        token,
      })
    }
  }
});