"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";

const LANGUAGES = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
  { code: "ja", label: "JP" },
  { code: "fr", label: "FR" },
];

function applyGoogleLanguage(code) {
  const combo = document.querySelector(".goog-te-combo");
  if (!combo) return false;
  combo.value = code;
  combo.dispatchEvent(new Event("change"));
  return true;
}

export default function LanguageSwitcher() {
  const [active, setActive] = useState("id");
  const pathname = usePathname();

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "id",
          includedLanguages: "id,en,ja,fr",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    if (!document.querySelector("script[data-google-translate]")) {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.dataset.googleTranslate = "true";
      document.body.appendChild(script);
    } else {
      window.googleTranslateElementInit?.();
    }
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language") || "id";
    setActive(saved);
    const timer = window.setTimeout(() => applyGoogleLanguage(saved), 700);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const chooseLanguage = (code) => {
    window.localStorage.setItem("portfolio-language", code);
    setActive(code);
    if (!applyGoogleLanguage(code)) {
      window.setTimeout(() => applyGoogleLanguage(code), 800);
    }
  };

  return (
    <div className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4rem)] right-5 z-[90] sm:right-6">
      <div id="google_translate_element" className="hidden" />
      <div className="flex items-center gap-1 rounded-2xl border border-line bg-surface/95 p-1.5 shadow-glass-lg backdrop-blur-xl">
        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-paper text-ink sm:flex">
          <Languages size={16} />
        </div>
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            onClick={() => chooseLanguage(language.code)}
            aria-label={`Terjemahkan ke ${language.label}`}
            className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold transition ${
              active === language.code ? "bg-ink text-paper" : "text-muted hover:bg-paper hover:text-ink"
            }`}
          >
            {language.label}
          </button>
        ))}
      </div>
    </div>
  );
}
