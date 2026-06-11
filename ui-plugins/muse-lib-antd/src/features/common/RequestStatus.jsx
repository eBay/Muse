import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Skeleton } from 'antd';
import { GlobalErrorBox, ErrorBox, GlobalLoading, LoadingMask } from '.';

export default function RequestStatus({
  pending = false,
  loading = false,
  error = null,
  errorMode = 'inline',
  dismissError = null,
  loadingMode = 'container',
  skeletonProps = {},
  errorProps = {},
}) {
  const errorArgs = errorProps || {};
  const isPending = pending || loading;
  const [defaultErrorBoxVisible, setDefaultErrorBoxVisible] = useState(true);
  const handleClickBox = () => {
    setDefaultErrorBoxVisible(false);
    dismissError();
  };

  if (errorMode === 'modal' && !dismissError) {
    return <div style={{ color: 'red' }}>Error mode 'modal' must be used with 'dismissError'.</div>;
  } else {
    return (
      <React.Fragment>
        {defaultErrorBoxVisible && dismissError && errorMode === 'modal' && error && (
          <GlobalErrorBox
            error={error}
            onClose={handleClickBox}
            onOk={null}
            okText={null}
            {...errorArgs}
          />
        )}

        {errorMode === 'inline' && error && (
          <ErrorBox error={error} dismissError={dismissError} {...errorArgs} />
        )}
        {loadingMode === 'global' && isPending && <GlobalLoading full />}
        {loadingMode === 'container' && isPending && <LoadingMask />}
        {loadingMode === 'skeleton' && isPending && <Skeleton active {...skeletonProps} />}
      </React.Fragment>
    );
  }
}
