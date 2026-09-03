import { useState, useEffect } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

export function useIsMobile() { return useWindowWidth() < 768; }
export function useIsTablet() { const w = useWindowWidth(); return w >= 768 && w < 1024; }
