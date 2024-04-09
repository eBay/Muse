import { Menu } from 'antd';
import jsPlugin from 'js-plugin';
import { flatten } from 'lodash';

export const versionDiffColorMap = {
  null: '#8bc34a',
  patch: '#ffc107',
  minor: '#9c27b0',
  major: '#e53935',
};

export default function EnvFilterMenu(props) {
  let items = [
    {
      label: (
        <span>
          <span className="inline-block w-3 h-3 rounded-md mr-2 bg-[#8bc34a]" />
          Up to date
        </span>
      ),
      key: 'null',
    },
    {
      label: (
        <span>
          <span className="inline-block w-3 h-3 rounded-md mr-2 bg-[#ffc107]" />
          Patch update
        </span>
      ),
      key: 'patch',
    },
    {
      label: (
        <span>
          <span className="inline-block w-3 h-3 rounded-md mr-2 bg-[#9c27b0]" />
          Minor update
        </span>
      ),
      key: 'minor',
    },
    {
      label: (
        <span>
          <span className="inline-block w-3 h-3 rounded-md mr-2 bg-[#e53935]" />
          Major update
        </span>
      ),
      key: 'major',
    },
    {
      label: (
        <span>
          <span className="inline-block w-3 h-3 rounded mr-2 bg-[#26c6da]" />
          Core plugin
        </span>
      ),
      key: 'core',
    },
  ];

  items.push(...flatten(jsPlugin.invoke('museManager.pm.pluginList.getEnvFilters', { ...props })));
  jsPlugin.invoke('museManager.pm.pluginList.processEnvFilters', { items, ...props });
  items = items.filter(Boolean);
  jsPlugin.sort(items);

  const clearItem = {
    label: (
      <p className="text-center border-0 border-t border-[#f0f0f0] border-solid py-1 mb-0">Clear</p>
    ),
    key: 'clear',
  };

  return (
    <div className="plugin-manager_home-env-filter-menu">
      <Menu items={[...items, clearItem]} {...props} />
    </div>
  );
}
