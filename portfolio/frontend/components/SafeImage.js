"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

export function initialsFrom(text = "") {
  return String(text)
    .split(/[\s—-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function LogoFallback({ label = "", icon: Icon = ImageOff }) {
  const initials = initialsFrom(label);

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-soft via-surface to-surface p-5">
      {initials ? (
        <span className="font-display text-2xl font-bold text-emerald-deep">{initials}</span>
      ) : (
        <Icon size={32} className="text-emerald-deep" />
      )}
    </div>
  );
}

function unavailableSource(src) {
  return !String(src || "").trim();
}

export default function SafeImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  fallback = null,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  loading,
  decoding = "async",
  quality = 70,
  ...props
}) {
  const [failed, setFailed] = useState(unavailableSource(src));

  useEffect(() => {
    setFailed(unavailableSource(src));
  }, [src]);

  if (failed) {
    return <div className={className}>{fallback || <LogoFallback label={alt} />}</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading || "lazy"}
        decoding={decoding}
        quality={quality}
        className={imgClassName}
        onError={() => setFailed(true)}
        {...props}
      />
    </div>
  );
}
