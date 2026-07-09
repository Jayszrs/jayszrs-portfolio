const ICONS = {
  Canva: "simple-icons:canva",
  CapCut: "arcticons:capcut",
  KineMaster: "arcticons:kinemaster",
  "Alight Motion": "arcticons:alight-motion",
  Figma: "logos:figma",
  "DaVinci Resolve": "simple-icons:davinciresolve",
  "VN Video Editor": "arcticons:vn",
  "Adobe Premiere Pro": "logos:adobe-premiere",
  React: "logos:react",
  JavaScript: "logos:javascript",
  CSS: "logos:css-3",
  HTML: "logos:html-5",
  PHP: "logos:php",
  Swift: "logos:swift",
  "Node.js": "logos:nodejs-icon",
  "Next.js": "logos:nextjs-icon",
  C: "logos:c",
  "C#": "logos:c-sharp",
  "C++": "logos:c-plusplus",
  Java: "logos:java",
  Python: "logos:python",
  Flutter: "logos:flutter",
  "Kali Linux": "simple-icons:kalilinux",
  "Arch Linux": "logos:archlinux",
  Linux: "logos:linux-tux",
  Windows: "logos:microsoft-windows-icon",
};

function initials(name) {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function BrandIcon({ name, size = "large", className = "" }) {
  const icon = ICONS[name];
  const dimensions = size === "small" ? "h-9 w-9" : size === "modal" ? "h-16 w-16" : "h-14 w-14";

  return (
    <span className={`${dimensions} flex shrink-0 items-center justify-center rounded-2xl border border-line/80 bg-white p-2.5 shadow-sm ${className}`}>
      {icon ? (
        <img
          src={`https://api.iconify.design/${icon}.svg`}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="font-display text-sm font-bold text-emerald">{initials(name)}</span>
      )}
    </span>
  );
}
