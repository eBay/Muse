import React from 'react';

export default function PluginVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const defaultPluginVars = app.pluginVariables ? Object.keys(app.pluginVariables) : [];

  return (
    <>
      <div>
        <h3 className="bg-gray-100 p-2 px-3">[Default] Plugin variables</h3>
        {defaultPluginVars.map(defPluginVar => {
          return (
            <div
              className="p-3"
              style={{ display: 'flex', justifyContent: 'flex-start', margin: '5px' }}
            >
              <span>{defPluginVar}</span>
              <span style={{ marginLeft: '15px' }}>
                {Object.keys(app.pluginVariables[defPluginVar]).map(defPluginVarValue => {
                  return (
                    <div>
                      {defPluginVarValue} = {app.pluginVariables[defPluginVar][defPluginVarValue]}
                    </div>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
