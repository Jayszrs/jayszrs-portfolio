"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function applyTheme(preference) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
}

export default function ThemeSwitcher() {
  const [preference, setPreference] = useState("system");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-theme") || "system";
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setPreference(saved);
    applyTheme(saved);

    const handleSystemChange = () => {
      if ((window.localStorage.getItem("portfolio-theme") || "system") === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  const chooseTheme = (value) => {
    window.localStorage.setItem("portfolio-theme", value);
    setPreference(value);
    setMenuOpen(false);
    applyTheme(value);
  };

  const CurrentIcon = OPTIONS.find((option) => option.value === preference)?.icon || Monitor;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-5 z-[90] sm:bottom-6 sm:right-6">
      <div className="hidden items-center gap-1 rounded-2xl border border-line bg-surface/90 p-1.5 shadow-glass-lg backdrop-blur-xl sm:flex">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => chooseTheme(option.value)}
              aria-label={`Gunakan tema ${option.label}`}
              aria-pressed={active}
              title={option.label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                active ? "bg-ink text-paper shadow-sm" : "text-muted hover:bg-paper hover:text-ink"
              }`}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      <div className="relative sm:hidden">
        {menuOpen && (
          <div className="absolute bottom-full right-0 mb-2 flex flex-col gap-1 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-glass-lg backdrop-blur-xl">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => chooseTheme(option.value)}
                  aria-label={`Gunakan tema ${option.label}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    preference === option.value ? "bg-ink text-paper" : "text-muted"
                  }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Pilih tema tampilan"
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line bg-surface/95 text-ink shadow-glass-lg backdrop-blur-xl"
        >
          <CurrentIcon size={17} />
        </button>
      </div>
    </div>
  );
}
