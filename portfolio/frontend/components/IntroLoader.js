"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function IntroLoader() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 7000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="splash-loader fixed inset-0 z-[200] flex items-center justify-center overflow-hidden" aria-label="Memuat portfolio">
      <div className="splash-mark px-8 text-center">
        <div className="splash-word font-display text-5xl font-extrabold lowercase text-paper sm:text-7xl">
          jayszrs
        </div>
      </div>
    </div>
  );
}
