'use client';
import { useCallback, useEffect, useState, type DependencyList } from 'react';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

/** Runs an async loader (e.g. a learningApi call) and exposes loading / error / data. */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList): AsyncState<T> & {reload: () => void;} {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ data: undefined, loading: true, error: null });
    loader().
    then((data) => active && setState({ data, loading: false, error: null })).
    catch((error: unknown) => active && setState({ data: undefined, loading: false, error: error instanceof Error ? error : new Error('Something went wrong') }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}