"use client";

import { useEffect, useRef } from "react";
import { createLanyardPhysics, ropePath } from "./lanyard-physics.cjs";

export default function useLanyardPhysics({ stage, badge, rope, leftEdge, rightEdge, mark, enabled, reduced, onDragChange }) {
  const controller = useRef(null);
  const mode = useRef({ enabled, reduced });
  const dragCallback = useRef(onDragChange);
  dragCallback.current = onDragChange;

  useEffect(() => {
    let simulation;
    let frame = 0;
    let lastTime = 0;
    let pointer = null;
    let measuredWidth = 0;
    let measuredHeight = 0;
    const root = stage.current;
    const card = badge.current;
    const draw = () => {
      const pose = simulation.pose();
      const d = ropePath(pose.rope);
      rope.current?.setAttribute("d", d);
      leftEdge.current?.setAttribute("d", ropePath(pose.rope, -10));
      rightEdge.current?.setAttribute("d", ropePath(pose.rope, 10));
      const middle = pose.rope[3];
      const before = pose.rope[2];
      const after = pose.rope[4];
      const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI - 90;
      mark.current?.setAttribute("transform", `translate(${middle.x - 8} ${middle.y - 8}) rotate(${angle} 8 8)`);
      card.style.width = `${pose.cardWidth}px`;
      card.style.transform = `translate3d(${pose.hook.x - pose.cardWidth / 2}px,${pose.hook.y + 22}px,0) rotate(${pose.angle}deg) rotateY(${pose.tilt}deg)`;
      root.dataset.physics = pose.dragging ? "dragging" : pose.sleeping ? "resting" : "swinging";
    };
    const tick = (time) => {
      frame = 0;
      if (!mode.current.enabled || mode.current.reduced) return;
      simulation.step(lastTime ? time - lastTime : 1000 / 60);
      lastTime = time;
      draw();
      if (!simulation.pose().sleeping) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && mode.current.enabled && !mode.current.reduced) { lastTime = 0; frame = requestAnimationFrame(tick); }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
    const coordinates = (event) => {
      const rect = root.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const resize = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      if (!width || !height) return;
      if (width === measuredWidth && height === measuredHeight) return;
      measuredWidth = width;
      measuredHeight = height;
      stop();
      pointer = null;
      dragCallback.current?.(false);
      const cardWidth = Math.max(170, Math.min(270, width - 56));
      simulation = createLanyardPhysics({ width, height, cardWidth, cardHeight: cardWidth / 0.7, initialSwing: !mode.current.reduced });
      draw(); wake();
    };
    const start = (event) => {
      if (!simulation || mode.current.reduced || !mode.current.enabled || event.button !== 0 || !event.isPrimary) return;
      pointer = { id: event.pointerId, start: coordinates(event), active: false };
      if (event.pointerType !== "touch") {
        pointer.active = true;
        simulation.beginDrag(pointer.start);
        card.setPointerCapture(event.pointerId);
        dragCallback.current?.(true);
        event.preventDefault();
      }
      wake();
    };
    const move = (event) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const point = coordinates(event);
      if (!pointer.active) {
        const dx = Math.abs(point.x - pointer.start.x);
        const dy = Math.abs(point.y - pointer.start.y);
        if (dy > dx + 7) { pointer = null; return; }
        if (dx < 7) return;
        pointer.active = true;
        simulation.beginDrag(pointer.start);
        card.setPointerCapture(event.pointerId);
        dragCallback.current?.(true);
      }
      event.preventDefault();
      simulation.dragTo(point);
      wake();
    };
    const release = () => {
      if (!pointer) return;
      if (pointer.active) simulation.endDrag();
      pointer = null;
      dragCallback.current?.(false);
      wake();
    };
    const reset = () => { release(); simulation?.reset(false); if (simulation) draw(); stop(); };
    const kick = (x, y) => { if (!mode.current.reduced && simulation) { simulation.kick(x, y); wake(); } };
    const key = (event) => {
      const impulses = { ArrowLeft: [-7, 0], ArrowRight: [7, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] };
      if (impulses[event.key]) { event.preventDefault(); kick(...impulses[event.key]); }
      if (event.key === "Home") { event.preventDefault(); reset(); }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    card.addEventListener("pointerdown", start);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
    card.addEventListener("lostpointercapture", release);
    card.addEventListener("keydown", key);
    controller.current = { wake, stop, reset, release, kick };
    resize();
    return () => {
      stop(); resizeObserver.disconnect(); controller.current = null;
      card.removeEventListener("pointerdown", start);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerup", release);
      card.removeEventListener("pointercancel", release);
      card.removeEventListener("lostpointercapture", release);
      card.removeEventListener("keydown", key);
    };
  }, [stage, badge, rope, leftEdge, rightEdge, mark]);

  useEffect(() => {
    mode.current = { enabled, reduced };
    if (reduced) controller.current?.reset();
    else if (enabled) controller.current?.wake();
    else { controller.current?.release(); controller.current?.stop(); }
  }, [enabled, reduced]);
  return controller;
}
