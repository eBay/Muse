import { register } from '@ebay/nice-modal-react';
import CreateAppModal from './features/am/CreateAppModal';
import EditAppModal from './features/am/EditAppModal';
import EditAppVariablesModal from './features/am/EditAppVariablesModal';
import EditPluginVariablesModal from './features/am/EditPluginVariablesModal';
import DeployPluginModal from './features/pm/DeployPluginModal';
import UndeployPluginModal from './features/pm/UndeployPluginModal';
import RequestDetailModal from './features/req/RequestDetailModal';
import CreatePluginModal from './features/pm/CreatePluginModal';
import PluginInfoModal from './features/pm/PluginInfoModal';
import PluginConfigModal from './features/pm/PluginConfigModal';
import ReleasesDrawer from './features/pm/ReleasesDrawer';
import EditEnvironmentModal from './features/am/EditEnvironmentModal';
import AddEnvironmentModal from './features/am/AddEnviromentModal';
import PreviewModal from './features/pm/PreviewModal';
import GroupDeployModal from './features/pm/GroupDeployModal';
import ValidationResultModal from './features/pm/ValidationResultModal';
import ReleaseInfoModal from './features/pm/ReleaseInfoModal';

register('muse-manager.create-app-modal', CreateAppModal);
register('muse-manager.edit-app-modal', EditAppModal);
register('muse-manager.plugin-config-modal', PluginConfigModal);
register('muse-manager.deploy-plugin-modal', DeployPluginModal);
register('muse-manager.undeploy-plugin-modal', UndeployPluginModal);
register('muse-manager.request-detail-modal', RequestDetailModal);
register('muse-manager.create-plugin-modal', CreatePluginModal);
register('muse-manager.plugin-info-modal', PluginInfoModal);
register('muse-manager.releases-drawer', ReleasesDrawer);
register('muse-manager.edit-environment-modal', EditEnvironmentModal);
register('muse-manager.preview-modal', PreviewModal);
register('muse-manager.add-env-modal', AddEnvironmentModal);
register('muse-manager.edit-app-variables-modal', EditAppVariablesModal);
register('muse-manager.edit-plugin-variables-modal', EditPluginVariablesModal);
register('muse-manager.group-deploy-modal', GroupDeployModal);
register('muse-manager.validation-result-modal', ValidationResultModal);
register('muse-manager.release-info-modal', ReleaseInfoModal);

// TRICKY! This is a dummy comp to ensure HMR of the modals can work!
export default function DummyComp() {
  return null;
}
