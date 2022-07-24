import { useEffect, useState } from 'react';
import { Button } from 'antd';
import polling from '@ebay/muse-lib-react/src/features/common/polling';
import museClient from '../../museClient';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
/**
 * @description Polling ci job log if the status is pending
 * @param {*} param0
 */

function CiOutput({ ci, jobName, buildNumber, state }) {
  const [log, setLog] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
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

  const style = {
    marginTop: '10px',
  };
  const fullscreenStyle = {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 9999,
    marginTop: 0,
  };

  const preStyle = {
    overflow: 'auto',
    maxHeight: 420,
    padding: 15,
    whiteSpace: 'pre-wrap',
    backgroundColor: '#f7f7f7',
    margin: 0,
  };

  if (fullscreen) {
    Object.assign(style, fullscreenStyle);
    Object.assign(preStyle, {
      maxHeight: 'none',
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '100%',
    });
  }

  const btnStyle = { position: 'absolute', right: '15px', zIndex: 10000 };
  return (
    <div style={style}>
      {log && (
        <Button size="small" onClick={() => setFullscreen(!fullscreen)} style={btnStyle}>
          {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      )}
      <pre style={preStyle}>
        {log || (buildNumber ? 'Loading...' : 'Waiting build to start...')}
      </pre>
    </div>
  );
}

export default CiOutput;
