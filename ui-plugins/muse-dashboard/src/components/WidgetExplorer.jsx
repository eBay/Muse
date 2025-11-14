import React, { useState, useCallback } from 'react';
import { Tree } from 'antd';
import _ from 'lodash';
import plugin from 'js-plugin';
import './WidgetExplorer.less';

const { TreeNode, DirectoryTree } = Tree;

export default function WidgetExplorer({ onChange }) {
  const categories = _.uniqBy(
    _.flatten(plugin.invoke('museDashboard.widget.getCategories')),
    'key',
  );
  const items = _.flatten(plugin.invoke('museDashboard.widget.getWidgets'));
  const itemByKey = _.keyBy(items, 'key');
  const itemsByCategory = _.groupBy(items, 'category');

  categories.sort((a, b) => a.name.localeCompare(b.name));
  items.sort((a, b) => a.name.localeCompare(b.name));

  const [selected, setSelected] = useState([]);
  const onSelect = useCallback(
    (keys) => {
      if (keys && keys[0] && keys[0].startsWith('category_')) return; // don't allow to select category
      const key = keys[0];
      setSelected([key]);
      onChange(itemByKey[key]);
    },
    [onChange, itemByKey],
  );
  return (
    <div className="muse-dashboard_widget-explorer">
      <DirectoryTree selectedKeys={selected} onSelect={onSelect}>
        {categories.map((c) => (
          <TreeNode
            title={`${c.name} (${itemsByCategory[c.key] ? itemsByCategory[c.key].length : 0})`}
            key={`category_${c.key}`}
          >
            {itemsByCategory[c.key]
              ? itemsByCategory[c.key].map((w) => <TreeNode title={w.name} key={w.key} />)
              : null}
          </TreeNode>
        ))}
      </DirectoryTree>
    </div>
  );
}
