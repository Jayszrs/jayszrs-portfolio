"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const SocialHub = dynamic(() => import("./SocialHub"));

export default function DeferredSocialHub(props) {
  const root = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return <div id="sosial-media" ref={root} className="min-h-[36rem] scroll-mt-28">{ready ? <SocialHub {...props} /> : <section className="section-pad py-14 sm:py-20"><div className="mx-auto max-w-7xl"><h2 className="font-display text-3xl font-semibold text-ink">Di luar portofolio.</h2><p className="mt-4 text-sm text-muted">LinkedIn, GitHub, Instagram, dan TikTok.</p></div></section>}</div>;
}
