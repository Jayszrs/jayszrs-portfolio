"use client";

import dynamic from "next/dynamic";

const LanguageSwitcher = dynamic(() => import("@/frontend/components/LanguageSwitcher"), {
  ssr: false,
});

export default function DeferredLanguageSwitcher() {
  return <LanguageSwitcher />;
}
