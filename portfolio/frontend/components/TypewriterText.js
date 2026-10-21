"use client";

import { useEffect, useMemo, useState } from "react";

export default function TypewriterText({ words = [], fallback = "Web Developer" }) {
  const list = useMemo(() => (words?.length ? words.filter(Boolean) : [fallback]), [fallback, words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState(list[0] || fallback);
  const [deleting, setDeleting] = useState(false);
  const [language, setLanguage] = useState("id");
  useEffect(() => {
    const sync = () => setLanguage(document.documentElement.dataset.language || "id");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-language"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setWordIndex(0);
    setText(list[0] || fallback);
    setDeleting(false);
  }, [fallback, list]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || list.length <= 1 || language !== "id") {
      setText(list[wordIndex % list.length] || fallback);
      return undefined;
    }

    const activeWord = list[wordIndex % list.length] || fallback;
    const isComplete = !deleting && text === activeWord;
    const isCleared = deleting && text.length === 0;

    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;

      if (isComplete) {
        setDeleting(true);
        return;
      }

      if (isCleared) {
        setDeleting(false);
        setWordIndex((current) => (current + 1) % list.length);
        return;
      }

      setText((current) => {
        if (deleting) return current.slice(0, -1);
        return activeWord.slice(0, current.length + 1);
      });
    }, isComplete ? 1300 : deleting ? 34 : 58);

    return () => window.clearTimeout(timer);
  }, [deleting, fallback, language, list, text, wordIndex]);

  return (
    <span className="inline-flex min-h-[1.3em] items-baseline">
      <span data-no-translate={language === "id" ? "" : undefined}>{language === "id" ? text || "\u00a0" : list[wordIndex % list.length] || fallback}</span>
      <span className="ml-1 inline-block h-[1em] w-0.5 translate-y-0.5 animate-pulse rounded-full bg-current" aria-hidden="true" />
    </span>
  );
}
