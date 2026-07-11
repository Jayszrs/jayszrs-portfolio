"use client";

import { useEffect, useMemo, useState } from "react";

export default function TypewriterText({ words = [], fallback = "Web Developer" }) {
  const list = useMemo(() => (words?.length ? words.filter(Boolean) : [fallback]), [fallback, words]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length <= 1) return undefined;

    const rotate = () => {
      if (document.visibilityState === "visible") {
        setIndex((current) => (current + 1) % list.length);
      }
    };

    const timer = window.setInterval(rotate, 3200);
    return () => window.clearInterval(timer);
  }, [list.length]);

  const activeWord = list[index % list.length] || fallback;

  return (
    <span className="inline-block min-h-[1.3em] transition-opacity duration-200">{activeWord}</span>
  );
}
