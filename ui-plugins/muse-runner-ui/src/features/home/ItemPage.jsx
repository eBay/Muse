import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs } from 'antd';
import TermOutput from './TermOutput';
import useRunnerData from './useRunnerData';
import WebTerminal from './WebTerminal';
import GitStatus from './GitStatus';
import lastTabKey from './lastTabKey';

export default function ItemPage() {
  const { currentItemId, tabKey } = useParams();
  const navigate = useNavigate();
  const { itemById } = useRunnerData();

  const rec = itemById?.[currentItemId];
  let output = null;
  if (rec) {
    const termId = rec.env ? `app:${rec.id}` : `plugin:${rec.dir}`;
    output = <TermOutput id={termId} />;
  }
  const items = [
    {
      key: 'output',
      label: 'Output',
      children: output,
    },
    rec?.dir && {
      key: 'terminal',
      label: 'Terminal',
      children: <WebTerminal key={rec.dir} dir={rec.dir} />,
    },
  ].filter(Boolean);

  useEffect(() => {
    lastTabKey[currentItemId] = tabKey;
  }, [tabKey, currentItemId]);
  return (
    <Tabs
      destroyInactiveTabPane
      size="small"
      className="h-full items-tabs-page"
      activeKey={tabKey || 'output'}
      items={items}
      tabBarExtraContent={<GitStatus dir={rec?.dir} className="mr-2" />}
      tabBarStyle={{ paddingLeft: 20, marginBottom: 0 }}
      onChange={(k) => navigate(`/${currentItemId}/${k}`)}
    />
  );
}
