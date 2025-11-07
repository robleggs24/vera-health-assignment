/**
 * Throttles a callback to run once per animation frame (16ms).
 * Prevents rapid re-renders during fast streaming.
 */
export function rafThrottle(fn: () => void) {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    const cb = () => {
      queued = false;
      fn();
    };
    if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(cb);
    else setTimeout(cb, 16);
  };
}
