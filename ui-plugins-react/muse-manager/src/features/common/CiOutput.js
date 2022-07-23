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
  //
  console.log(arguments);
  const [log, setLog] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    // if (status !== 'pending') return;
    if (!jobName || !buildNumber) return;
    const poller = polling({
      task: async () => {
        try {
          const text = await museClient.ebay.ci.build.log(jobName, buildNumber);
          setLog(text);
        } catch (err) {}
      },
    });
    return () => poller.stop();
  }, [state, jobName, buildNumber]);

  // useEffect(() => {
  //   if (!log && build)
  //     fetchBuildLog({ appName: build.ci, buildNumber: build.number, jobName: 'create-release' });
  // }, [build, log, building, fetchBuildLog]);

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
      <pre style={preStyle}>{log || 'Loading...'}</pre>
    </div>
  );
}

export default CiOutput;
