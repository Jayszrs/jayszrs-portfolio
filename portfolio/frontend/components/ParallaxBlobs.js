"use client";

export default function ParallaxBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden md:block">
      <div className="absolute -left-24 -top-24 h-[340px] w-[340px] rounded-full bg-emerald/10 blur-[90px]" />
      <div className="absolute -right-28 top-[40%] h-[360px] w-[360px] rounded-full bg-gold/10 blur-[96px]" />
    </div>
  );
}
