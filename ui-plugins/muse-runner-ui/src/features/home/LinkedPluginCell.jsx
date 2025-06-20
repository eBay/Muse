import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import api from './api';

import vscodeIcon from './vscode.svg';

import { useMutation, useQueryClient } from '@tanstack/react-query';

const LinkedPluginCell = ({ plugin, onRemove }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: unlinkPlugin } = useMutation({
    mutationFn: async () => {
      await api.post('/unlink-plugin', {
        mainPlugin: plugin.mainPlugin,
        linkedPlugin: plugin.name,
      });
      await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
      onRemove();
    },
  });

  return (
    <div className="combined-plugin-cell grid grid-cols-[18px_1fr_30px_20px] cursor-default mt-1">
      <span />
      <span className="text-gray-500 whitespace-nowrap text-ellipsis overflow-hidden">
        <span className="text-gray-600">linked:</span> {plugin.name}
      </span>
      {plugin.dir ? (
        <img
          src={vscodeIcon}
          alt=""
          onClick={() => api.post('/open-code', { dir: plugin.dir })}
          title="Open in VSCode"
          className="w-3 h-3 text-emerald-500 cursor-pointer scale-150 self-center justify-self-center"
        />
      ) : (
        <span />
      )}
      <DeleteOutlined
        className="text-red-600 cursor-pointer justify-self-center"
        onClick={unlinkPlugin}
      />
    </div>
  );
};
export default LinkedPluginCell;
