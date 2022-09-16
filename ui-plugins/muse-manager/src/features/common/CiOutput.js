import { useEffect, useState } from 'react';
import polling from '@ebay/muse-lib-react/src/features/common/polling';
import museClient from '../../museClient';
import { LogViewer } from './';
/**
 * @description Polling ci job log if the status is pending
 * @param {*} param0
 */

function CiOutput({ ci, jobName, buildNumber, state }) {
  const [log, setLog] = useState('');
  useEffect(() => {
    if (!ci || !jobName || !buildNumber) return;
    const poller = polling({
      interval: 1000,
      stopIf: () => state !== 'pending',
      task: async () => {
        try {
          const text = await museClient.ebay.ci.client.build.log(jobName, buildNumber);
          setLog(text);
        } catch (err) {}
      },
    });
    return () => poller.stop();
  }, [ci, jobName, buildNumber, state]);

  return <LogViewer log={log} loading={buildNumber ? 'Loading...' : 'Waiting build to start...'} />;
}

export default CiOutput;
