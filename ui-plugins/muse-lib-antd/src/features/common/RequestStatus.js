import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Skeleton } from 'antd';
import { GlobalErrorBox, ErrorBox, GlobalLoading, LoadingMask } from '.';

export default function RequestStatus(props) {
  const { errorMode, loadingMode, dismissError, error, skeletonProps = {} } = props;
  const errorArgs = props.errorProps || props.errorArgs || {};
  const pending = props.pending || props.loading;
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
        {loadingMode === 'global' && pending && <GlobalLoading full />}
        {loadingMode === 'container' && pending && <LoadingMask />}
        {loadingMode === 'skeleton' && pending && <Skeleton active {...skeletonProps} />}
      </React.Fragment>
    );
  }
}

RequestStatus.propTypes = {
  pending: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.any,
  errorMode: PropTypes.oneOf(['inline', 'modal']),
  loadingMode: PropTypes.oneOf(['container', 'global', 'skeleton']),
  dismissError: PropTypes.func,
  skeletonProps: PropTypes.object,
  errorProps: PropTypes.object,
};
RequestStatus.defaultProps = {
  pending: false,
  loading: false,
  error: null,
  errorMode: 'inline',
  dismissError: null,
  loadingMode: 'container',
};
