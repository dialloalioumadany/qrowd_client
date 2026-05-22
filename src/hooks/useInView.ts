import { useState, useCallback, useRef } from 'react';

/** Returns true once the element enters the viewport (fires once, then disconnects) */
export function useInView(threshold = 0.15) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      observer.observe(node);
      observerRef.current = observer;
    }
  }, [threshold]);

  return { ref, inView };
}
