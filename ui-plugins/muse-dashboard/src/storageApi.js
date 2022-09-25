import jsPlugin from 'js-plugin';
import _ from 'lodash';
const ls = window.localStorage;

const delay = t => new Promise(resolve => setTimeout(resolve, t));

const getDashboardList = async dashboardKey => {
  await delay(1000);
  const sKey = _.kebabCase(dashboardKey);
  const s = ls.getItem(`museDashboardList.${sKey}`);
  if (!s) return [];
  return JSON.parse(s);
};
const getDashboard = async (dashboardKey, dashboardName) => {
  await delay(1000);
  const sKey = _.kebabCase(dashboardKey);
  const sName = _.kebabCase(dashboardName);
  const s = ls.getItem(`museDashboard.${sKey}.${sName}`);
  if (!s) return null;
  return JSON.parse(s);
};
const saveDashboard = async (dashboardKey, dashboardName, value) => {
  await delay(1000);
  const sKey = _.kebabCase(dashboardKey);
  const sName = _.kebabCase(dashboardName);
  ls.setItem(`museDashboard.${sKey}.${sName}`, JSON.stringify(value));
  const list = (await getDashboardList(dashboardKey)) || [];
  const found = _.find(list, { name: dashboardName });
  if (!found) {
    list.push({
      name: dashboardName,
    });
    ls.setItem(`museDashboardList.${sKey}`, JSON.stringify(list));
  }
};
const deleteDashboard = async (dashboardKey, dashboardName) => {
  await delay(1000);
  const sKey = _.kebabCase(dashboardKey);
  const sName = _.kebabCase(dashboardName);
  ls.removeItem(`museDashboard.${sKey}.${sName}`);
  const list = (await getDashboardList(dashboardKey)) || [];
  const found = _.find(list, { name: dashboardName });
  if (found) {
    _.remove(list, { name: dashboardName });
    ls.setItem(`museDashboardList.${sKey}`, JSON.stringify(list));
  }
};

const localStorageApi = {
  getDashboardList,
  getDashboard,
  saveDashboard,
  deleteDashboard,
};

let provider;
function getProvider() {
  if (!provider) {
    provider = jsPlugin.invoke('museDashboard.getStorageProvider')[0];
  }
  if (!provider) {
    provider = localStorageApi;
  }
  return provider;
}

const storageApi = {
  getDashboardList: (...args) => {
    return getProvider().getDashboardList(...args);
  },
  getDashboard: (...args) => {
    return getProvider().getDashboard(...args);
  },
  saveDashboard: (...args) => {
    return getProvider().saveDashboard(...args);
  },
  deleteDashboard: (...args) => {
    return getProvider().deleteDashboard(...args);
  },
};

export default storageApi;
