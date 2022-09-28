import { RefObject, useEffect, useMemo, useState } from "react";

export const useIsInViewport = <TRef extends Element>(ref: RefObject<TRef>) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(
        ([entry]) => entry && setIsIntersecting(entry.isIntersecting)
      ),
    []
  );

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [ref.current, observer]);

  return isIntersecting;
};
