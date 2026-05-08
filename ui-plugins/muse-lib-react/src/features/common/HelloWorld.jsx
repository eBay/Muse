import React from 'react';
import Test1 from './Test1';
export default function HelloWorld() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', color: '#1890ff', marginBottom: '20px' }}>Hello World!</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Welcome to your MUSE plugin. This is a simple hello world page.
      </p>
      <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>Route: /hello</p>
      <Test1 />
    </div>
  );
}
