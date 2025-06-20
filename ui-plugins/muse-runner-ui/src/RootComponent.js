import { useEffect, useRef, useCallback, useState } from 'react';
import store from '@ebay/muse-lib-react/src/common/store';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useEvent } from 'react-use';
import useRunnerData from './features/home/useRunnerData';
import api from './features/home/api';

export default function RootComponent() {
  const queryClient = useQueryClient();
  const wsRef = useRef(null);
  const msgKeyRef = useRef(null);
  const [socketClosed, setSocketClosed] = useState(false);

  const { initData } = useRunnerData();

  useEffect(() => {
    if (!initData) return;
    store.dispatch({
      type: 'MUSE_RUNNER_OUTPUT',
      payload: _.flatten(Object.values(initData.msgCache))
        .filter((data) => data.type === 'output')
        .map((d) => d.data),
    });

    store.dispatch({
      type: 'MUSE_RUNNER_INIT_DATA',
      payload: _.omit(initData, ['msgCache']),
    });
  }, [initData]);

  const connectSocket = useCallback(() => {
    return new Promise((resolve) => {
      console.log('[Muse Runner] Connecting socket...');
      const socketURL = `${api.baseURL.replace('http://', 'ws://')}/muse-runner-socket`;

      // const socketURL = `ws://localhost:6066/muse-runner-socket`;
      const ws = new WebSocket(socketURL);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('[Muse Runner] Socket connected.');
        // Hide error message if it's shown
        if (msgKeyRef.current) {
          msgKeyRef.current = null;
          message.destroy('runner-socket-closed');
          message.success({
            content: 'Socket re-connected.',
            duration: 3,
          });
        }
        setSocketClosed(false);
        resolve();
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        switch (data.type) {
          case 'output':
            store.dispatch({
              type: 'MUSE_RUNNER_OUTPUT',
              payload: data.data,
            });
            break;
          case 'config-data-changed':
            queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
            break;
          case 'running-data-changed':
            queryClient.setQueryData(['running-data'], data.data);
            break;
          case 'git-status-changed':
            queryClient.setQueryData(['git-status'], data.data);
            break;
          case 'app-exited':
          case 'plugin-exited':
            // TODO: handle app/plugin unexpected exit
            break;

          default:
            store.dispatch({
              type: 'ON_SOCKET_MESSAGE',
              payload: data.data,
            });
            break;
        }
      };

      ws.onclose = () => {
        console.log('[Muse Runner] Socket closed.');
        setSocketClosed(true);
        if (!msgKeyRef.current) {
          msgKeyRef.current = message.error({
            key: 'runner-socket-closed',
            content:
              'Muse Runner socket closed, please ensure Muse Runner is running then refresh the page.',
            duration: 0,
          });
        }
      };
      ws.onerror = (evt) => {
        console.error('[Muse Runner] Socket failed.');
      };
    });
  }, [queryClient]);

  useEffect(() => {
    if (wsRef.current || !queryClient) return;
    connectSocket();
  }, [queryClient, connectSocket]);

  useEvent('focus', () => {
    if (socketClosed && queryClient) {
      connectSocket().then(() => {
        queryClient.refetchQueries({ queryKey: ['running-data'], exact: true });
        queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
      });
    }
  });
  return null;
}
