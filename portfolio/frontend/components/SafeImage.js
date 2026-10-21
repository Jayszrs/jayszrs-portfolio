"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { mediaSource, serveImageDirectly } from "@/frontend/lib/media";
import unavailableLegacyMedia from "@/frontend/lib/unavailable-legacy-media.json";

const unavailableLegacy = new Set(unavailableLegacyMedia);

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
  return !String(src || "").trim() || unavailableLegacy.has(src);
}

export function ImageUnavailable() {
  return (
    <div role="status" className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
      <ImageOff size={32} className="text-muted" />
      <p className="text-sm font-semibold text-ink">Gambar belum tersedia.</p>
      <p className="max-w-sm text-sm text-muted">File sumber belum bisa diakses. Coba lagi nanti.</p>
    </div>
  );
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
  unoptimized = false,
  onError,
  ...props
}) {
  const source = mediaSource(src);
  const [failedSource, setFailedSource] = useState(null);
  const [directSource, setDirectSource] = useState(null);
  const direct = unoptimized || serveImageDirectly(source) || directSource === source;
  const failed = unavailableSource(source) || failedSource === source;

  if (failed) {
    return <div className={className}>{fallback || <LogoFallback label={alt} />}</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        {...props}
        key={`${source}-${direct}`}
        src={source}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading || "lazy"}
        decoding={decoding}
        quality={quality}
        unoptimized={direct}
        className={imgClassName}
        onError={(event) => {
          // An optimizer failure need not mean the original remote image is unavailable.
          if (!direct && /^https?:\/\//i.test(source)) setDirectSource(source);
          else {
            setFailedSource(source);
            onError?.(event);
          }
        }}
      />
    </div>
  );
}
