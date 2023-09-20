import { useState, useCallback } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { message, Modal } from 'antd';
import museClient from '../museClient';

export default function useValidateDeployment() {
  const [validateDeploymentPending, setValidateDeploymentPending] = useState(false);
  const [validateDeploymentError, setValidateDeploymentError] = useState(null);
  // const { mutateAsync: realValidateDeployment } = useMuseMutation('analyzer.validateDeployment');

  const validateDeployment = useCallback(async ({ deployment, appName, envs }) => {
    const validationResult = {};
    message.loading({
      key: 'validate-deployment-msg',
      content: 'Validating deployment...',
      duration: 0,
    });
    setValidateDeploymentPending(true);
    setValidateDeploymentError(null);
    try {
      await Promise.all(
        envs.map(async (envName) => {
          validationResult[envName] = null; // to keep the order
          const result = await museClient.analyzer.validateDeployment({
            appName,
            envName,
            deployment,
          });

          validationResult[envName] = result;
        }),
      );
    } catch (e) {
      console.error(e);
      Modal.error({ title: 'Error', content: 'Failed to validate deployment, please retry.' });
      setValidateDeploymentError(e);
      return false;
    } finally {
      message.destroy('validate-deployment-msg');
      setValidateDeploymentPending(false);
    }

    const success = Object.values(validationResult).every((r) => r.success);
    let continueDeploy = success; // if continue deployment after validation failed
    if (!success) {
      continueDeploy = await NiceModal.show('muse-manager.validation-result-modal', {
        result: validationResult,
      });
    }
    return continueDeploy;
  }, []);

  return {
    validateDeployment,
    validateDeploymentPending,
    validateDeploymentError,
  };
}
