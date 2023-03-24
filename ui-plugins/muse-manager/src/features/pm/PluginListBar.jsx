import NiceModal from '@ebay/nice-modal-react';
import { Radio, Button, Select } from 'antd';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import SearchBox from '../common/SearchBox';
import { useSearchState } from '../../hooks';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import config from '../../config';

export default function PluginListBar({ app }) {
  const [scope, setScope] = useSearchState(
    'scope',
    app ? 'deployed' : config.get('pluginListDefaultScope'),
  );
  const [envName, setEnv] = useSearchState('env', config.get('pluginListDefaultEnv'));

  let dropdownItems = [
    app && {
      key: 'env',
      highlight: true,
      render: () => {
        const envs = Object.keys(app.envs || {}).map((envName) => ({
          value: envName,
          label: envName,
        }));
        const options = [{ value: 'all', label: 'All Environments' }].concat(envs);

        return (
          <Select
            key="envSelect"
            value={envName}
            onChange={setEnv}
            style={{ width: '160px', textAlign: 'left', marginRight: '8px' }}
            dropdownMatchSelectWidth={false}
            options={options}
          />
        );
      },
    },
    {
      key: 'scope',
      highlight: true,
      render: () => {
        const scopes = [
          { key: 'all', label: 'All Plugins', onClick: () => setScope('all'), order: 100 },
        ];
        if (app) {
          scopes.push({
            key: 'deployed',
            label: 'Deployed Plugins',
            order: 50,
            onClick: () => setScope('deployed'),
          });
        }
        scopes.push(
          ..._.flatten(jsPlugin.invoke('museManager.pluginListBar.getScopes', { setScope, scope })),
        );
        jsPlugin.sort(scopes);

        return scopes.length > 1 ? (
          <Radio.Group value={scope}>
            {scopes.map((s) => {
              return (
                <Radio.Button value={s.key} key={s.key} onClick={() => s.onClick()}>
                  {s.label}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        ) : null;
      },
    },
    {
      key: 'createPlugin',
      highlight: true,
      render: () => {
        return (
          <Button
            type="primary"
            onClick={() => NiceModal.show('muse-manager.create-plugin-modal', { app: app.name })}
          >
            Create Plugin
          </Button>
        );
      },
    },
    app && {
      key: 'preview',
      label: 'Preview',
      onClick: () => {
        NiceModal.show('muse-manager.preview-modal', { app });
      },
    },
    app && {
      key: 'multi-deployment',
      label: 'Multi-Deployment',
      onClick: () => {
        NiceModal.show('muse-manager.multi-deployment-modal', { app });
      },
    },
  ];

  dropdownItems.push(
    ..._.flatten(jsPlugin.invoke('museManager.pluginListBar.getDropdownItems', { app })),
  );
  jsPlugin.invoke('museManager.pluginListBar.processDropdownItems', { dropdownItems, app });
  dropdownItems = dropdownItems.filter(Boolean);

  return (
    <div className="flex mb-4 justify-end gap-2 whitespace-nowrap">
      <SearchBox
        placeholder="Search by plugin name or owners..."
        className="min-w-[100px] max-w-[400px] mr-auto"
        allowClear={true}
      />
      {dropdownItems.length > 0 && <DropdownMenu items={dropdownItems} size="default" />}
    </div>
  );
}
