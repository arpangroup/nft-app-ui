import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Load data for a screen:  const { data, loading, error, reload } = useApi(() => api.getOrders(), []);
 * Ignores responses that arrive after unmount or after deps changed.
 * `reload({ silent: true })` refreshes without flashing the loading state.
 */
export default function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  const callId = useRef(0);

  const load = useCallback(({ silent = false } = {}) => {
    const id = ++callId.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    return fetcher()
      .then((data) => id === callId.current && setState({ data, loading: false, error: null }))
      .catch((error) => id === callId.current && setState((s) => ({ ...s, loading: false, error })));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    return () => {
      callId.current++;
    };
  }, [load]);

  return { ...state, reload: load };
}
