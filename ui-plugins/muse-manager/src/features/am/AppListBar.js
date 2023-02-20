import { Radio } from 'antd';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import SearchBox from '../common/SearchBox';
import { useSearchState } from '../../hooks';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import config from '../../config';

export default function AppListBar() {
  const [scope, setScope] = useSearchState('scope', config.get('appListDefaultScope'));
  const scopes = [{ key: 'all', label: 'All Apps', onClick: () => setScope('all'), order: 100 }];

  scopes.push(
    ..._.flatten(jsPlugin.invoke('museManager.appListBar.getScopes', { setScope, scope })),
  );
  jsPlugin.sort(scopes);

  const dropdownItems = [];

  dropdownItems.push(..._.flatten(jsPlugin.invoke('museManager.appListBar.getDropdownItems', {})));
  jsPlugin.invoke('museManager.appListBar.processDropdownItems', { dropdownItems });

  return (
    <div className="flex mb-2 justify-end gap-2 whitespace-nowrap">
      <SearchBox
        placeholder="Search by app name or owners..."
        className="min-w-[100px] max-w-[400px] mr-auto"
        allowClear={true}
      />
      {scopes.length > 1 ? (
        <Radio.Group value={scope}>
          {scopes.map((s) => {
            return (
              <Radio.Button value={s.key} key={s.key} onClick={() => s.onClick()}>
                {s.label}
              </Radio.Button>
            );
          })}
        </Radio.Group>
      ) : null}
      <DropdownMenu items={dropdownItems} size="default" />
    </div>
  );
}
