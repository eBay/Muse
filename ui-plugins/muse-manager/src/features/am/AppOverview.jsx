import React from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { Button } from 'antd';
import AppBasicInfo from './AppBasicInfo';
import Environments from './Environments';
import { useAbility } from '../../hooks';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
export default function AppOverview({ app }) {
  const ability = useAbility();
  const canUpdateApp = ability.can('update', 'App', app);

  const nodes = [
    {
      order: 10,
      node: (
        <section key="basicInfo">
          <h3>
            Basic Information
            {canUpdateApp && (
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
      ),
    },
    {
      order: 20,
      node: (
        <section key="envs">
          <h3>Environments</h3>
          <div className="p-3">
            <Environments app={app} />
          </div>
        </section>
      ),
    },
  ];

  extendArray(nodes, 'nodes', 'museManager.am.appOverview', { app, nodes });

  return <div>{nodes.map((n) => n.node).filter(Boolean)}</div>;
}
