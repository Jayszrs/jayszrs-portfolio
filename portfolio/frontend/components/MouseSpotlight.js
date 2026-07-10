"use client";

import { useEffect, useRef } from "react";

export default function MouseSpotlight() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow || window.matchMedia("(pointer: coarse)").matches) return undefined;

    let frame;
    const moveGlow = (event) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${event.clientX - 130}px, ${event.clientY - 90}px, 0)`;
        glow.style.opacity = "1";
      });
    };
    const hideGlow = () => {
      glow.style.opacity = "0";
    };

    window.addEventListener("pointermove", moveGlow, { passive: true });
    document.documentElement.addEventListener("mouseleave", hideGlow);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", moveGlow);
      document.documentElement.removeEventListener("mouseleave", hideGlow);
    };
  }, []);

  return <div ref={glowRef} className="mouse-spotlight" aria-hidden="true" />;
}
