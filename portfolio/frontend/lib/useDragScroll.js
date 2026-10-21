"use client";

import { useEffect } from "react";

export default function useDragScroll(ref) {
  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    let pointer = null;
    let suppressUntil = 0;
    const down = (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("input, textarea, select")) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, left: track.scrollLeft, dragging: false };
    };
    const move = (event) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      if (!pointer.dragging) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(event.clientY - pointer.y)) return;
        pointer.dragging = true;
        track.setPointerCapture(event.pointerId);
        track.dataset.dragging = "true";
      }
      event.preventDefault();
      track.scrollLeft = pointer.left - dx;
    };
    const up = () => {
      if (pointer?.dragging) suppressUntil = performance.now() + 250;
      if (pointer && track.hasPointerCapture(pointer.id)) track.releasePointerCapture(pointer.id);
      pointer = null;
      delete track.dataset.dragging;
    };
    const click = (event) => {
      if (event.detail && performance.now() < suppressUntil) { event.preventDefault(); event.stopPropagation(); }
    };
    const wheel = (event) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > 1 || (!event.shiftKey && event.deltaMode !== 1 && Math.abs(event.deltaY) < 40)) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 32 : 1);
      if ((delta > 0 && track.scrollLeft < track.scrollWidth - track.clientWidth - 1) || (delta < 0 && track.scrollLeft > 1)) {
        event.preventDefault();
        track.scrollLeft += delta;
      }
    };
    const preventNativeDrag = (event) => event.preventDefault();
    track.addEventListener("pointerdown", down);
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    track.addEventListener("lostpointercapture", up);
    track.addEventListener("dragstart", preventNativeDrag);
    track.addEventListener("click", click, true);
    track.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("blur", up);
    return () => {
      up();
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("lostpointercapture", up);
      track.removeEventListener("dragstart", preventNativeDrag);
      track.removeEventListener("click", click, true);
      track.removeEventListener("wheel", wheel);
      window.removeEventListener("blur", up);
    };
  }, [ref]);
}
