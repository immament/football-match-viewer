export function round(val: number, precision = 2) {
  const v = Math.pow(10, precision);
  return Math.round(val * v) / v;
}
/**
 * Creates a throttled version of the provided callback function that will only
 * execute at most once in the specified delay period.
 *
 * @template T - The type of the callback function.
 * @param {T} callback - The function to throttle.
 * @param {number} delay - The delay period in milliseconds during which the callback
 *                         can only be called once.
 * @returns {T} - The throttled version of the callback function.
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  let timer: number | undefined;
  return ((...args) => {
    if (!timer) {
      callback(...args);
      timer = setTimeout(() => {
        timer = undefined;
      }, delay);
    }
  }) as T;
}
/**
 * Creates a debounced function that delays invoking the provided callback until after
 * the specified delay has elapsed since the first time the debounced function was invoked.
 *
 * @template T - The type of the callback function.
 * @param {T} callback - The function to debounce.
 * @param {number} delay - The number of milliseconds to delay.
 * @returns {T} - The debounced function.
 */

export function debounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  let timer: number | undefined;
  let lastArgs: Parameters<T>;
  return ((...args) => {
    lastArgs = args;

    timer ??= setTimeout(() => {
      callback(...lastArgs);
      clearTimeout(timer);
      timer = undefined;
    }, delay);
  }) as T;
}

export function useRandomTraceId(_name: string, _toConsole = true) {
  return;
  // const dbg_randId = useRef(Math.round(Math.random() * 100000));
  // if (toConsole) logger.info("traceId:", name, dbg_randId.current);
  // return dbg_randId;
}
