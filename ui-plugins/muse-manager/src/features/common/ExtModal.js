import { useState, useMemo, useEffect } from 'react';

/**
 * A common UI logic that handles a form/modal with extensible header, body and footer.
 * Also it handles pending, error status with extensibility.
 * @returns
 */
export default function ExtModal({}) {
  const [pendingMap, setPendingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  // const modal = useModal();
  // const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const {
    mutateAsync: deployPlugin,
    error: deployPluginError,
    isLoading: deployPluginPending,
  } = useMuseMutation('pm.deployPlugin');

  useEffect(() => {
    setPendingMap((m) => ({ ...m, deployPluginPending }));
  }, [deployPluginPending]);

  useEffect(() => {
    setErrorMap((m) => ({ ...m, deployPluginError }));
  }, [deployPluginError]);

  const { validateDeployment, validateDeploymentError, validateDeploymentPending } =
    useValidateDeployment();

  useEffect(() => {
    setPendingMap((m) => ({ ...m, validateDeploymentPending }));
  }, [validateDeploymentPending]);

  useEffect(() => {
    setErrorMap((m) => ({ ...m, validateDeploymentError }));
  }, [validateDeploymentError]);

  const pending = useMemo(() => Object.values(pendingMap).some(Boolean), [pendingMap]);
  const error = useMemo(() => Object.values(errorMap).filter(Boolean)[0] || null, [errorMap]);

  return null;
}
