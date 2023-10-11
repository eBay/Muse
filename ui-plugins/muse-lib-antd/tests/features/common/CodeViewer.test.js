import React from 'react';
import { render, screen } from '@testing-library/react';
import { CodeViewer } from '../../../src/features/common';

describe('common/CodeViewer', () => {

  const code = `apiVersion: v1
kind: Pod
metadata:
  name: frontend
spec:
  containers:
  - name: db
    image: mysql
    env:
    - name: MYSQL_ROOT_PASSWORD
      value: "password"
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
  - name: wp
    image: wordpress
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
`;

  it('renders CodeViewer', () => {
    render(<CodeViewer title="example.yaml" code={code} language="yaml" allowCopy theme="light" />);
    expect(screen.getByText('example.yaml')).toBeTruthy();
    expect(screen.getByText('Copy to Clipboard')).toBeTruthy();
  });

  it('renders CodeViewer without title', () => {
    render(<CodeViewer code={code} language="yaml" allowCopy theme="light" />);
    expect(screen.queryByLabelText('example.yaml')).toBeFalsy();    
  });

  it('renders CodeViewer without copy clipboard', () => {
    render(<CodeViewer code={code} language="yaml" theme="light" />);
    expect(screen.queryByLabelText('example.yaml')).toBeFalsy();
    expect(screen.queryByText('Copy to Clipboard')).toBeFalsy();
  });

  it('renders CodeViewer with dark theme', () => {
    const { container } = render(<CodeViewer title="example.yaml" code={code} language="yaml" allowCopy theme="dark" />);
    expect(container.querySelector('.common-code-viewer-dark')).toBeTruthy();    
  });
});