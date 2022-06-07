const { asyncInvoke, osUsername } = require('../utils');
const getRequest = require('./getRequest');
const deleteRequest = require('./deleteRequest');
const pm = require('../pm');

module.exports = async ({ requestId, msg, author = osUsername }) => {
  const ctx = {};
  await asyncInvoke('museCore.req.beforeApplyRequest', ctx, requestId);

  const req = await getRequest(requestId);
  const { type, payload } = req;

  try {
    await asyncInvoke('museCore.req.applyRequest', ctx);
    switch (type) {
      case 'deploy-plugin':
        await pm.deployPlugin({ ...payload, msg: msg || `Apply request of ${type} by ${author}.` });
        break;
      default:
        break;
    }
    await deleteRequest(requestId);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke('museCore.req.failedApplyRequest', ctx);
    throw err;
  }
  await asyncInvoke('museCore.req.afterApplyRequest', ctx);
  return ctx.request;
};
