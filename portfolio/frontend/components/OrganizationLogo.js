"use client";

import { useId, useState } from "react";
import SafeImage from "@/frontend/components/SafeImage";
import { mediaSource } from "@/frontend/lib/media";
import { classifyLogoPixels, normalizeLogoAppearance } from "@/frontend/lib/logo-appearance.cjs";

const appearances = new Map();

function inspectLogo(image) {
  const canvas = document.createElement("canvas");
  const longest = Math.max(image.naturalWidth, image.naturalHeight, 1);
  canvas.width = Math.max(2, Math.round(image.naturalWidth / longest * 64));
  canvas.height = Math.max(2, Math.round(image.naturalHeight / longest * 64));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return "original";
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return classifyLogoPixels(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
}

/** For brand marks only. Documentation photographs must continue using SafeImage. */
export default function OrganizationLogo({
  src,
  appearance = "auto",
  className = "",
  imgClassName = "",
  style,
  onLoad,
  ...props
}) {
  const source = mediaSource(src);
  // This recovered crest has both black side bars and a white plate outside its shield.
  const shield = source === '/organization-logos/smpn-135.jpg';
  const detailedCrest = shield || source === '/recovered-media/1ac4730e7c009a7394f7.webp';
  const requested = normalizeLogoAppearance(shield && appearance === 'auto' ? 'remove-white' : appearance);
  const [sample, setSample] = useState(null);
  const id = `organization-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const resolved = requested !== "auto"
    ? requested
    : sample?.source === source ? sample.appearance : appearances.get(source) || "original";
  const keyed = resolved === "remove-white" || resolved === "remove-black";
  const filter = resolved === "white" ? "brightness(0) invert(1)" : keyed ? `url(#${id})` : undefined;

  function loaded(event) {
    if (requested === "auto") {
      let detected = appearances.get(source);
      if (!detected) {
        detected = "original";
        try {
          detected = inspectLogo(event.currentTarget);
          appearances.set(source, detected);
        } catch {
          // Cross-origin images without canvas access retain their original appearance.
        }
      }
      setSample({ source, appearance: detected });
    }
    onLoad?.(event);
  }

  return (
    <span className={`relative block ${className}`} data-organization-logo="" data-logo-appearance={resolved}>
      {keyed && (
        <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
          <defs>
            <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={resolved === "remove-white"
                ? "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -.2126 -.7152 -.0722 0 1"
                : "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  .2126 .7152 .0722 0 0"} />
              <feComponentTransfer>{detailedCrest ? <feFuncA type="gamma" amplitude="1" exponent=".65" offset="0" /> : <feFuncA type="linear" slope="3" />}</feComponentTransfer>
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
          </defs>
        </svg>
      )}
      <SafeImage
        {...props}
        src={src}
        className="h-full w-full"
        imgClassName={`h-full w-full object-contain ${imgClassName}`}
        style={{ ...style, ...(filter ? { filter } : {}), ...(shield && requested !== 'original' ? { clipPath: 'polygon(49% 1%, 70% 10%, 84% 35%, 82% 63%, 71% 93%, 46% 97%, 25% 93%, 14% 67%, 14% 36%, 34% 12%)' } : {}) }}
        onLoad={loaded}
      />
    </span>
  );
}
