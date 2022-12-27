import React from 'react';
import { Descriptions, Button } from 'antd';
import { useAbility } from '../../hooks';

export default function AppVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const defaultAppVars = app.variables ? Object.keys(app.variables) : [];
  const ability = useAbility('App');

  return (
    <>
      <div>
        <h3 className="bg-gray-100 p-2 px-3 my-2">
          [Default] Application variables
          {ability.can('update', app) && (
            <Button type="link" onClick={() => {}} size="small" className="float-right">
              Edit
            </Button>
          )}
        </h3>
        {defaultAppVars.map(defAppVar => {
          return (
            <Descriptions column="1" bordered>
              <Descriptions.Item span="2" label={defAppVar}>
                {app.variables[defAppVar]}
              </Descriptions.Item>
            </Descriptions>
          );
        })}
      </div>
      {envs.map(env => {
        const currentEnvVariables = app.envs[env].variables
          ? Object.keys(app.envs[env].variables)
          : [];
        return (
          <div>
            <h3 className="bg-gray-100 p-2 px-3 my-2">
              [{env}] Application variables
              {ability.can('update', app) && (
                <Button type="link" onClick={() => {}} size="small" className="float-right">
                  Edit
                </Button>
              )}
            </h3>
            {currentEnvVariables.map(envVar => {
              return (
                <Descriptions column="1" bordered>
                  <Descriptions.Item span="2" label={envVar}>
                    {app.envs[env].variables[envVar]}
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
