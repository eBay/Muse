import { register } from '@ebay/nice-modal-react';
import CreateAppModal from './features/am/CreateAppModal';
import BuildPluginModal from './features/pm/BuildPluginModal';
import DeployPluginModal from './features/pm/DeployPluginModal';
import RequestDetailModal from './features/req/RequestDetailModal';
import CreatePluginModal from './features/pm/CreatePluginModal';

register('muse-manager.create-app-modal', CreateAppModal);
register('muse-manager.build-plugin-modal', BuildPluginModal);
register('muse-manager.deploy-plugin-modal', DeployPluginModal);
register('muse-manager.request-detail-modal', RequestDetailModal);
register('muse-manager.create-plugin-modal', CreatePluginModal);
