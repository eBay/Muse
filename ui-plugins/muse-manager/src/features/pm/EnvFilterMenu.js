import { Menu } from 'antd';

export default function EnvFilterMenu(props) {
  const items = [
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
          <span className="inline-block w-3 h-3 rounded mr-2 bg-[#f06292]" />
          Allowlisted
        </span>
      ),
      key: 'whitelist',
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
    {
      label: <p className="text-center border-0 border-t border-[#f0f0f0] border-solid">Clear</p>,
      key: 'clear',
    },
  ];
  return (
    <div className="plugin-manager_home-env-filter-menu">
      <Menu items={items} {...props} />
    </div>
  );
}
