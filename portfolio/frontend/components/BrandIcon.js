"use client";

import { Code2 } from "lucide-react";
import icons from "@/frontend/lib/skill-icons.json";

const COLORS = {
  Canva: "#00a9b7", KineMaster: "#e94e5f", "Alight Motion": "#46aead",
  "DaVinci Resolve": "#507a9c", React: "#4babc5", JavaScript: "#c7a630",
  CSS: "#2872c4", HTML: "#cf5938", PHP: "#727fae", Swift: "#e86c42",
  "Node.js": "#689c52", C: "#5b82ac", "C#": "#8b5da7", "C++": "#447eb2",
  Java: "#b86b48", Python: "#4c7f9f", Flutter: "#419cc4", "Arch Linux": "#3987ae",
};

export default function BrandIcon({ name, size = "large", className = "" }) {
  const icon = icons[name];
  const monochrome = icon && /^(?:simple-icons|arcticons):/.test(icon.icon);
  return <span aria-hidden="true" className={`brand-object brand-object--${size} ${className}`} style={{ "--brand-color": COLORS[name] || "rgb(var(--color-ink))", ...(icon ? { "--brand-mask": `url("${icon.src}")` } : {}) }}>
    <span className="brand-plinth" />
    {icon ? <span className="brand-sculpture">
      <span className="brand-extrusion" />
      {monochrome ? <span className="brand-ink" /> : <img src={icon.src} width="64" height="64" alt="" loading="lazy" decoding="async" draggable={false} className="brand-face" />}
    </span> : <Code2 size={36} className="relative text-muted" />}
  </span>;
}
