import { type MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';

/**
 * A custom hook that provides copy-to-clipboard functionality with a temporary "copied" state.
 * @param onCopy A function that performs the copy action, which can be synchronous or return a Promise.
 * @param timeout The duration in milliseconds for which the "copied" state remains true.
 * @returns A tuple containing the "copied" state and an onClick handler to trigger the copy action.
 */
export function useCopyButton(
  onCopy: () => void | Promise<void>,
  timeout = 2000,
): [checked: boolean, onClick: MouseEventHandler] {
  const [checked, setChecked] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const onClick: MouseEventHandler = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    const res = Promise.resolve(onCopy());

    void res.then(() => {
      setChecked(true);
      timeoutRef.current = window.setTimeout(() => {
        setChecked(false);
      }, timeout);
    });
  }, [onCopy, timeout]);

  // Avoid updates after being unmounted
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return [checked, onClick];
}
