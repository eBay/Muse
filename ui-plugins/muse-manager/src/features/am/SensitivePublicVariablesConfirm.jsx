import React from 'react';
import { Modal } from 'antd';
import {
  PUBLIC_VARIABLES_ALERT_DESCRIPTION,
  PUBLIC_VARIABLES_ALERT_TITLE,
} from './publicVariableSecurity';

export function SensitivePublicVariablesConfirmContent({ keys }) {
  return (
    <>
      Potential credentials detected in:{' '}
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && ', '}
          <b>{key}</b>
        </React.Fragment>
      ))}
      . {PUBLIC_VARIABLES_ALERT_DESCRIPTION}
    </>
  );
}

export const confirmSensitivePublicVariables = (findings) => {
  if (!findings?.length) return Promise.resolve(true);

  const keys = [...new Set(findings.map(({ key }) => key))];

  return new Promise((resolve) => {
    Modal.confirm({
      title: PUBLIC_VARIABLES_ALERT_TITLE,
      width: 480,
      content: <SensitivePublicVariablesConfirmContent keys={keys} />,
      okText: 'Save anyway',
      cancelText: 'Go back',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};
