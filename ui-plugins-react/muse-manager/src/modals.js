import NiceModal from '@ebay/nice-modal-react';
import BuildPluginModal from './features/pm/BuildPluginModal';
import DeployPluginModal from './features/pm/DeployPluginModal';
NiceModal.register('muse-manager.build-plugin-modal', BuildPluginModal);
NiceModal.register('muse-manager.deploy-plugin-modal', DeployPluginModal);
// const modals = {};
// export default modals;
