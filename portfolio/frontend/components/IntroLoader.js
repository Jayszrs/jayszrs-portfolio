"use client";

import { useEffect, useState } from "react";

export default function IntroLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash-loader fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-paper" aria-label="Memuat portfolio">
      <div className="splash-mark relative text-center">
        <div className="splash-rings" aria-hidden="true" />
        <div className="splash-word font-display text-5xl font-extrabold lowercase text-ink sm:text-7xl">
          {"jayszrs".split("").map((letter, index) => (
            <span key={`${letter}-${index}`} style={{ animationDelay: `${index * 90}ms` }}>
              {letter}
            </span>
          ))}
        </div>
        <div className="splash-line mx-auto mt-7 h-px w-52 overflow-hidden bg-line sm:w-64" aria-hidden="true">
          <span />
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.35em] text-muted">Portfolio loading</p>
      </div>
    </div>
  );
}
