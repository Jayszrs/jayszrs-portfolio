"use client";

import { useEffect, useMemo, useState } from "react";

export default function TypewriterText({ words = [], fallback = "Web Developer" }) {
  const list = useMemo(() => (words.length ? words : [fallback]), [fallback, words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [letters, setLetters] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = list[wordIndex % list.length];
    const finished = letters === word.length;
    const empty = letters === 0;
    const delay = finished && !deleting ? 1400 : deleting ? 38 : 72;

    const timer = window.setTimeout(() => {
      if (finished && !deleting) {
        setDeleting(true);
      } else if (empty && deleting) {
        setDeleting(false);
        setWordIndex((current) => (current + 1) % list.length);
      } else {
        setLetters((current) => current + (deleting ? -1 : 1));
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [deleting, letters, list, wordIndex]);

  const activeWord = list[wordIndex % list.length];

  return (
    <span className="inline-flex min-h-[1.3em] items-center">
      <span>{activeWord.slice(0, letters)}</span>
      <span className="ml-1 inline-block h-[1em] w-[3px] animate-pulse bg-emerald" aria-hidden="true" />
    </span>
  );
}
