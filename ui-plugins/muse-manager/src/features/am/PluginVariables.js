import React from 'react';
import { Descriptions, Button } from 'antd';
import { useAbility } from '../../hooks';
import NiceModal from '@ebay/nice-modal-react';

export default function PluginVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const defaultPluginVars = app.pluginVariables ? Object.keys(app.pluginVariables) : [];
  const ability = useAbility('App');

  return (
    <>
      <div>
        <h3 className="bg-gray-100 p-2 px-3 my-2">
          [Default] Plugin variables
          {ability.can('update', app) && (
            <Button
              type="link"
              onClick={() =>
                NiceModal.show('muse-manager.edit-plugin-variables-modal', { app, env: null })
              }
              size="small"
              className="float-right"
            >
              Edit
            </Button>
          )}
        </h3>
        {defaultPluginVars.map(defPluginVar => {
          return (
            <Descriptions column="1" bordered>
              <Descriptions.Item label={defPluginVar}>
                <Descriptions column="1" bordered>
                  {Object.keys(app.pluginVariables[defPluginVar]).map(defPluginVarValue => {
                    return (
                      <Descriptions.Item span="4" label={defPluginVarValue}>
                        {app.pluginVariables[defPluginVar][defPluginVarValue]}
                      </Descriptions.Item>
                    );
                  })}
                </Descriptions>
              </Descriptions.Item>
            </Descriptions>
          );
        })}
      </div>
      {envs.map(env => {
        const currentEnvVariables = app.envs[env].pluginVariables
          ? Object.keys(app.envs[env].pluginVariables)
          : [];
        return (
          <div>
            <h3 className="bg-gray-100 p-2 px-3 my-2">
              [{env}] Plugin variables
              {ability.can('update', app) && (
                <Button
                  type="link"
                  onClick={() =>
                    NiceModal.show('muse-manager.edit-plugin-variables-modal', { app, env: env })
                  }
                  size="small"
                  className="float-right"
                >
                  Edit
                </Button>
              )}
            </h3>
            {currentEnvVariables.map(defPluginVar => {
              return (
                <Descriptions column="1" bordered>
                  <Descriptions.Item label={defPluginVar}>
                    <Descriptions column="1" bordered>
                      {Object.keys(app.envs[env].pluginVariables[defPluginVar]).map(
                        defPluginVarValue => {
                          return (
                            <Descriptions.Item span="4" label={defPluginVarValue}>
                              {app.envs[env].pluginVariables[defPluginVar][defPluginVarValue]}
                            </Descriptions.Item>
                          );
                        },
                      )}
                    </Descriptions>
                  </Descriptions.Item>
                </Descriptions>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
