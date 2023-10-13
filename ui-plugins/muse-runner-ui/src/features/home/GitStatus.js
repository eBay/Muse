import React from 'react';
import { Tooltip } from 'antd';
import { BranchesOutlined, ArrowUpOutlined } from '@ant-design/icons';
import useRunnerData from './useRunnerData';

export default function GitBranchLabel({ dir, className = '' }) {
  const { gitStatus } = useRunnerData();

  if (!dir || !gitStatus[dir]) return null;
  const data = gitStatus[dir];
  return (
    <label className={'text-gray-500 ' + className}>
      <BranchesOutlined className="mr-1" />
      {data.current}

      {data?.ahead > 0 ? (
        <Tooltip title={`${data.ahead} commit${data.ahead > 1 ? 's' : ''} ahead.`}>
          <span className="ml-1 bg-gray-700 text-gray-400 border-rad text-xs rounded-full h-3 pl-1 pr-1">
            <ArrowUpOutlined className="scale-75" />
          </span>
        </Tooltip>
      ) : null}

      {data?.files?.length > 0 ? (
        <Tooltip title="There are uncommitted changes.">
          <span className="h-2 w-2 inline-block bg-blue-600 rounded-full ml-1"></span>
        </Tooltip>
      ) : null}
    </label>
  );
}
