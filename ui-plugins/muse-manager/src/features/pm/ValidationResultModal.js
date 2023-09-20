import _ from 'lodash';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Tag, Alert, Tabs } from 'antd';

const MissingModulesView = ({ missingModules, type }) => {
  if (_.isEmpty(missingModules)) {
    return null;
  }
  const missingModulesByPlugin = _.groupBy(
    missingModules || {},
    (m) => `${m.plugin}@${m.version} -> ${m.sharedFrom}:`,
  );

  if (_.isEmpty(missingModulesByPlugin)) return null;

  return (
    <p>
      <h4 className="font-bold text-red-500">
        Missing shared modules {type !== 'dist' ? <Tag color="orange">@{type}</Tag> : ''}:
      </h4>
      {type === 'dist' && (
        <Alert
          className="mb-3"
          message="Plugins which miss modules will fail to load."
          type="error"
          showIcon
        />
      )}
      {type === 'dev' && (
        <Alert
          className="mb-3"
          message="While there're missing modules @dev, it causes issues for local development."
          type="warning"
          showIcon
        />
      )}
      {type === 'test' && (
        <Alert
          className="mb-3"
          message="While there're missing modules @test, it causes issues for e2e testing."
          type="warning"
          showIcon
        />
      )}
      <dl>
        {Object.entries(missingModulesByPlugin).map(([plugin, modules]) => (
          <>
            <dt className="font-normal">
              <strong>
                {modules[0].plugin}@{modules[0].version}
              </strong>{' '}
              expected below modules from <strong>{modules[0].sharedFrom}</strong>:
            </dt>
            {modules.slice(0, 10).map((m) => (
              <dd key={m.moduleId} className="ml-3 flex text-gray-500">
                <span className="mr-1">-</span>
                <span>{m.moduleId}</span>
              </dd>
            ))}
            {modules.length > 10 ? (
              <dd key="more" className="ml-3 flex text-gray-500">
                <span className="mr-1">-</span>
                <span>...</span>
              </dd>
            ) : null}
            <dd className="mb-5"></dd>
          </>
        ))}
      </dl>
    </p>
  );
};

const ValidationResult = ({ result = {} }) => {
  return (
    <div>
      {result.missingBootPlugin ? (
        <p>
          <h4 className="font-bold text-red-500">No boot plugin:</h4> One app should have a boot
          plugin, there will be no boot plugin after deployment.
        </p>
      ) : null}

      {result.multipleBootPlugins ? (
        <p>
          <h4 className="font-bold text-red-500">Multiple boot plugins:</h4> One app should onely
          have one boot plugin, but there will be "{result.multipleBootPlugins.join('", "')}".
        </p>
      ) : null}

      {!_.isEmpty(result.dist?.missingModules) ? (
        <MissingModulesView missingModules={result.dist.missingModules} type="dist" />
      ) : null}
      {_.isEmpty(result.dist?.missingModules) && !_.isEmpty(result.dev?.missingModules) ? (
        <MissingModulesView missingModules={result.dev.missingModules} type="dev" />
      ) : null}
      {_.isEmpty(result.dist?.missingModules) && !_.isEmpty(result.test?.missingModules) ? (
        <MissingModulesView missingModules={result.test.missingModules} type="test" />
      ) : null}
      <p className="mb-6"></p>
    </div>
  );
};

const ValidationResultModal = NiceModal.create(({ result = {} }) => {
  const modal = useModal();
  const envs = Object.keys(result).filter((env) => result[env].success === false);
  return (
    <Modal
      {...antdModalV5(modal)}
      title={<span className="text-red-500">Deployment Validation Failed</span>}
      width="800px"
      okText="I understand the danger, but continue the deployment."
      onOk={() => {
        modal.resolve(true);
        modal.hide();
      }}
      okButtonProps={{
        type: 'primary',
        danger: true,
        style: { float: 'left', marginLeft: 0 },
      }}
      onCancel={() => {
        modal.resolve(false);
        modal.hide();
      }}
      maskClosable={false}
      className="muse-manager_pm-validate-result-modal "
    >
      <Tabs
        defaultActiveKey={envs[0]}
        animated={{ inkBar: true, tabPane: true }}
        items={envs.map((envName) => ({
          key: envName,
          label: envName,
          children: <ValidationResult key={envName} result={result[envName]} />,
        }))}
      ></Tabs>
    </Modal>
  );
});

export default ValidationResultModal;
