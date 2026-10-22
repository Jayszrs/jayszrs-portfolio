"use client";

import { useEffect, useRef } from "react";

const stack = [];
let previousOverflow = "";
const selector = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary,iframe,[tabindex]:not([tabindex="-1"])';

export default function useDialog(open, onClose) {
  const ref = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    const prior = document.activeElement;
    const entry = { node };
    if (!stack.length) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.dataset.dialogOpen = "true";
      document.dispatchEvent(new Event("portfolio:dialogchange"));
    }
    stack.push(entry);
    const focusable = () => [...node.querySelectorAll(selector)].filter((element) => element.getClientRects().length && !element.closest('[inert], [aria-hidden="true"]'));
    const focusFirst = () => (node.querySelector("[data-dialog-close]") || focusable()[0] || node).focus({ preventScroll: true });
    const frame = requestAnimationFrame(focusFirst);
    const handleKey = (event) => {
      if (stack[stack.length - 1] !== entry) return;
      if (event.key === "Escape") {
        event.preventDefault(); event.stopImmediatePropagation(); close.current?.();
      } else if (event.key === "Tab") {
        const items = focusable();
        const first = items[0] || node, last = items[items.length - 1] || node;
        if (!items.length || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
          event.preventDefault(); (event.shiftKey ? last : first).focus();
        }
      }
    };
    const handleFocus = (event) => { if (stack[stack.length - 1] === entry && !node.contains(event.target)) focusFirst(); };
    document.addEventListener("keydown", handleKey, true);
    document.addEventListener("focusin", handleFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("focusin", handleFocus);
      const wasTop = stack[stack.length - 1] === entry;
      stack.splice(stack.indexOf(entry), 1);
      if (!stack.length) {
        document.body.style.overflow = previousOverflow;
        delete document.documentElement.dataset.dialogOpen;
        document.dispatchEvent(new Event("portfolio:dialogchange"));
      }
      if (wasTop && prior?.isConnected && typeof prior.focus === "function") prior.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}
