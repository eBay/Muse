module.exports = () => {
  return {
    plugins: [[
      '../../muse-git-storage',
      {
        url: 'https://github.corp.ebay.com',
        organizationName: 'gling',
        projectName: 'muse-registry-sample',
        token: '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'
      }
    ]]
  };
}