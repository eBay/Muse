import React from 'react';
import { Descriptions, Button } from 'antd';
import NiceModal from '@ebay/nice-modal-react';

export default function PluginVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const defaultPluginVars = app.pluginVariables ? Object.keys(app.pluginVariables) : [];

  return (
    <>
      <div>
        <h3 className="p-2 px-3 my-2">
          [Default] Plugin variables
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
        </h3>
        <Descriptions
          column={1}
          bordered
          labelStyle={{ width: '30%' }}
          contentStyle={{ width: '70%' }}
        >
          {defaultPluginVars.map((defPluginVar) => {
            return (
              <Descriptions.Item
                label={defPluginVar}
                labelStyle={{ width: '30%' }}
                contentStyle={{ width: '70%', padding: '5px 5px' }}
                key={defPluginVar}
              >
                <Descriptions column={1} bordered>
                  {Object.keys(app.pluginVariables[defPluginVar]).map((defPluginVarValue) => {
                    return (
                      <Descriptions.Item
                        contentStyle={{ width: '70%', padding: '5px 10px' }}
                        label={defPluginVarValue}
                        labelStyle={{ width: '30%' }}
                        key={`${defPluginVar}-${defPluginVarValue}`}
                      >
                        {app.pluginVariables[defPluginVar][defPluginVarValue]}
                      </Descriptions.Item>
                    );
                  })}
                </Descriptions>
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      </div>
      {envs.map((env) => {
        const currentEnvVariables = app.envs[env].pluginVariables
          ? Object.keys(app.envs[env].pluginVariables)
          : [];
        return (
          <div key={env}>
            <h3 className="p-2 px-3 my-2">
              [{env}] Plugin variables
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
            </h3>
            <Descriptions
              column={1}
              bordered
              labelStyle={{ width: '30%' }}
              contentStyle={{ width: '70%' }}
            >
              {currentEnvVariables.map((defPluginVar) => {
                return (
                  <Descriptions.Item
                    labelStyle={{ width: '30%' }}
                    label={defPluginVar}
                    contentStyle={{ width: '70%', padding: '5px 5px' }}
                    key={`${env}-${defPluginVar}`}
                  >
                    <Descriptions
                      column={1}
                      bordered
                      labelStyle={{ width: '30%' }}
                      contentStyle={{ width: '70%' }}
                    >
                      {Object.keys(app.envs[env].pluginVariables[defPluginVar]).map(
                        (defPluginVarValue) => {
                          return (
                            <Descriptions.Item
                              label={defPluginVarValue}
                              contentStyle={{ width: '70%', padding: '5px 10px' }}
                              labelStyle={{ width: '30%' }}
                              key={`${env}-${defPluginVar}-${defPluginVarValue}`}
                            >
                              {app.envs[env].pluginVariables[defPluginVar][defPluginVarValue]}
                            </Descriptions.Item>
                          );
                        },
                      )}
                    </Descriptions>
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </div>
        );
      })}
    </>
  );
}
