import { lazy, type ComponentType } from 'react';

/**
 * React.lazy for a named export, plus a `preload()` that warms the same chunk (used to prefetch
 * likely-next screens after first paint). Both share one promise, so nothing is fetched twice.
 */
export function lazyScreen<K extends string, M extends Record<K, ComponentType>>(
  loader: () => Promise<M>,
  name: K,
) {
  let promise: Promise<M> | null = null;
  const load = () => (promise ??= loader());
  const Component = lazy(() => load().then((m) => ({ default: m[name] })));
  return { Component, preload: load };
}
