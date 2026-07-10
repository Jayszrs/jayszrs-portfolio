"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function ParallaxBlobs() {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const { scrollYProgress } = useScroll();

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -260]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 320]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 40]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!enabled) return null;

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ y: y1 }}
        className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-emerald/20 blur-[100px] animate-drift"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[40%] -right-32 h-[480px] w-[480px] rounded-full bg-gold/10 blur-[110px] animate-drift"
      />
      <motion.div
        style={{ y: y3, rotate }}
        className="absolute bottom-0 left-[20%] h-[360px] w-[360px] rounded-full bg-emerald/10 blur-[90px]"
      />
    </div>
  );
}
