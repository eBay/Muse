import { useState, useCallback } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { message, Modal } from 'antd';
import { useMuseMutation } from '../../hooks';

export default function useValidateDeployment() {
  const {
    mutateAsync: realValidateDeployment,
    error: validateDeploymentError,
    isLoading: validateDeploymentPending,
  } = useMuseMutation('analyzer.validateDeployment');

  const validateDeployment = async ({ deployment, appName, envs }) => {
    const validationResult = {};
    message.loading({ key: 'deployment-msg', content: 'Validating deployment...', duration: 0 });
    try {
      await Promise.all(
        envs.map(async (env) => {
          validationResult[env] = null; // to keep the order
          const result = await realValidateDeployment({
            _museParams: [appName, env, deployment],
          });
          validationResult[env] = result;
        }),
      );
    } catch (e) {
      console.error(e);
      Modal.error({ title: 'Error', content: 'Failed to validate deployment, please retry.' });
      return;
    } finally {
      message.destroy('deployment-msg');
    }

    const success = Object.values(validationResult).every((r) => r.success);
    let continueDeploy = success; // if continue deployment after validation failed
    if (!success) {
      continueDeploy = await NiceModal.show('muse-manager.validation-result-modal', {
        result: validationResult,
      });
    }
    if (!continueDeploy) return;
  };

  return {
    validateDeployment,
    validateDeploymentPending,
    validateDeploymentError,
  };
}
