"use client";

import { useEffect, useState } from "react";

export default function usePageActivity(ref) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    let visible = false;
    const sync = () => setActive(visible && !document.hidden && document.documentElement.dataset.dialogOpen !== "true" && document.documentElement.dataset.scrollActive !== "true");
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("portfolio:dialogchange", sync);
    document.addEventListener("portfolio:scrollactivity", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); document.removeEventListener("portfolio:dialogchange", sync); document.removeEventListener("portfolio:scrollactivity", sync); };
  }, [ref]);
  return active;
}
