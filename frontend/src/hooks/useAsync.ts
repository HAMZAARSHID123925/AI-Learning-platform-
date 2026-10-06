'use client';
import { useCallback, useEffect, useState, type DependencyList } from 'react';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/** Runs an async loader (e.g. a learningApi call) and exposes loading / error / data. */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> & {reload: () => void;} {
  const [state, setState] = useState<AsyncState<T> & {request?: object}>({ data: undefined, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  // Track request inputs during render so changed inputs expose loading before effects.
  const [request, setRequest] = useState(() => ({deps, nonce}));
  if (nonce !== request.nonce || deps.length !== request.deps.length || deps.some((value, index) => !Object.is(value, request.deps[index]))) {
    setRequest({deps, nonce});
  }

  useEffect(() => {
    let active = true;
    loader().
    then((data) => active && setState({ request, data, loading: false, error: null })).
    catch((error: unknown) => active && setState({ request, data: undefined, loading: false, error: error instanceof Error ? error : new Error('Something went wrong') }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return state.request === request ? { ...state, reload } : {data: undefined, loading: true, error: null, reload};
}