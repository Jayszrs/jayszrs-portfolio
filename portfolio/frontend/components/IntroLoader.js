"use client";

import { useEffect, useState } from "react";

export default function IntroLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="pixel-loader fixed inset-0 z-[200] flex items-center justify-center bg-white" aria-label="Memuat portfolio">
      <div className="text-center">
        <div className="mx-auto grid w-fit grid-cols-5 gap-1">
          {Array.from({ length: 20 }).map((_, index) => (
            <span
              key={index}
              className="pixel-block h-3 w-3 bg-emerald"
              style={{ animationDelay: `${index * 35}ms` }}
            />
          ))}
        </div>
        <p className="mt-6 font-display text-2xl font-bold tracking-tight text-emerald">JAY SZRS.</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.35em] text-emerald/60">Loading portfolio</p>
      </div>
    </div>
  );
}
