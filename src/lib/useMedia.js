import { useSyncExternalStore } from 'react';

// true mientras la media query se cumpla (por ejemplo, pantalla de celular)
export default function useMedia(query) {
  return useSyncExternalStore(
    cb => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
