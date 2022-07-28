import NiceModal from '@ebay/nice-modal-react';
import BuildPluginModal from './features/pm/BuildPluginModal';
import DeployPluginModal from './features/pm/DeployPluginModal';
import RequestDetailModal from './features/req/RequestDetailModal';
NiceModal.register('muse-manager.build-plugin-modal', BuildPluginModal);
NiceModal.register('muse-manager.deploy-plugin-modal', DeployPluginModal);
NiceModal.register('muse-manager.request-detail-modal', RequestDetailModal);
// const modals = {};
// export default modals;
