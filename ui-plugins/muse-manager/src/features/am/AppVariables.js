import React from 'react';

export default function AppVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const defaultAppVars = app.variables ? Object.keys(app.variables) : [];

  return (
    <>
      <div>
        <h3 className="bg-gray-100 p-2 px-3">[Default] Application variables</h3>
        {defaultAppVars.map(defAppVar => {
          return (
            <div className="p-3">
              {defAppVar} = {app.variables[defAppVar]}
            </div>
          );
        })}
      </div>
      {envs.map(env => {
        const currentEnvVariables = app.envs[env].variables
          ? Object.keys(app.envs[env].variables)
          : [];
        return (
          <div>
            <h3 className="bg-gray-100 p-2 px-3">[{env}] Application variables</h3>
            {currentEnvVariables.map(envVar => {
              return (
                <div className="p-3">
                  {envVar} = {app.envs[env].variables[envVar]}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
