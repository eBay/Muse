import NiceModal from '@ebay/nice-modal-react';
import { Button } from 'antd';
import AppBasicInfo from './AppBasicInfo';
import Environments from './Environments';
import { useAbility } from '../../hooks';

export default function AppOverview({ app }) {
  const ability = useAbility('App');

  return (
    <div>
      <section>
        <h3>
          Basic Information
          {ability.can('update', app) && (
            <Button
              type="link"
              onClick={() => NiceModal.show('muse-manager.edit-app-modal', { app })}
              size="small"
              className="float-right"
            >
              Edit
            </Button>
          )}
        </h3>
        <div className="p-3">
          <AppBasicInfo app={app} />
        </div>
      </section>
      <section>
        <h3>
          Environments
          {ability.can('update', app) && (
            <Button
              type="link"
              onClick={() => NiceModal.show('muse-manager.add-env-modal', { app })}
              size="small"
              className="float-right"
            >
              Add Environment
            </Button>
          )}
        </h3>
        <div className="p-3">
          <Environments app={app} />
        </div>
      </section>
    </div>
  );
}
