"use client";

export default function TikTokIcon({ size = 18, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: "currentColor",
        WebkitMask: "url(/icons/tiktok.svg) center / contain no-repeat",
        mask: "url(/icons/tiktok.svg) center / contain no-repeat",
      }}
    />
  );
}
