import { useState, useMemo, useCallback } from 'react';

/**
 * A hook to manage multiple pending and error status.
 * @param {*} pendings
 * @param {*} errors
 * @returns
 */
export default function usePendingError(pendings = [], errors = []) {
  const [pendingMap, setPendingMap] = useState({});
  const [errorMap, setErrorMap] = useState({});

  const pending =
    useMemo(() => Object.values(pendingMap).some(Boolean), [pendingMap]) ||
    pendings.some((p) => !!p);
  const error =
    useMemo(() => Object.values(errorMap).filter(Boolean)[0] || null, [errorMap]) ||
    errors.filter(Boolean)[0] ||
    null;

  const setPending = useCallback(
    () => (key, value) => setPendingMap((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const setError = useCallback(
    () => (key, value) => setErrorMap((prev) => ({ ...prev, [key]: value })),
    [],
  );

  return {
    setPending,
    setError,
    pending,
    error,
  };
}
