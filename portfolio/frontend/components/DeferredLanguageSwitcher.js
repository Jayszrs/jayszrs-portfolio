"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LanguageSwitcher = dynamic(() => import("@/frontend/components/LanguageSwitcher"), {
  ssr: false,
});

export default function DeferredLanguageSwitcher() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(() => setReady(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? <LanguageSwitcher /> : null;
}
