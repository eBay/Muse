import { useState } from 'react';
import { Button } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
/**
 * @description
 * @param {*} param0
 */

function LogViewer({ log, loading = 'Loading log...' }) {
  const [fullscreen, setFullscreen] = useState(false);

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
      <pre style={preStyle}>{log || loading}</pre>
    </div>
  );
}

export default LogViewer;
