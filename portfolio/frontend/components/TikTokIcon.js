"use client";

export default function TikTokIcon({ size = 18, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        backgroundColor: "currentColor",
        WebkitMask: "url(https://api.iconify.design/simple-icons:tiktok.svg) center / contain no-repeat",
        mask: "url(https://api.iconify.design/simple-icons:tiktok.svg) center / contain no-repeat",
      }}
    />
  );
}
