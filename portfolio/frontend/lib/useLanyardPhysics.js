"use client";

import { useEffect, useRef } from "react";
import { createLanyardPhysics, ropePath, ribbonPath, fitLanyardView } from "./lanyard-physics.cjs";

export default function useLanyardPhysics({ stage, badge, rigging, rope, leftEdge, rightEdge, mark, enabled, reduced, onDragChange }) {
  const controller = useRef(null);
  const mode = useRef({ enabled, reduced });
  const dragCallback = useRef(onDragChange);
  dragCallback.current = onDragChange;

  useEffect(() => {
    let simulation;
    let frame = 0;
    let lastTime = 0;
    let pointer = null;
    let view = { x: 0, y: 0, scale: 1 };
    let measuredWidth = 0;
    let measuredHeight = 0;
    const root = stage.current;
    const card = badge.current;
    const draw = (instant = false) => {
      const pose = simulation.pose();
      const rect = pointer ? root.getBoundingClientRect() : null;
      const grabbedScreen = pointer ? { x: pointer.last.clientX - rect.left, y: pointer.last.clientY - rect.top } : null;
      const fitted = fitLanyardView(pose, measuredWidth, measuredHeight - 22, 12, grabbedScreen);
      if (instant || pose.sleeping || pose.dragging || mode.current.reduced || root.dataset.physics === undefined) view = fitted;
      else view = { x: view.x + (fitted.x - view.x) * .24, y: view.y + (fitted.y - view.y) * .24, scale: view.scale + (fitted.scale - view.scale) * .24 };
      rigging.current?.setAttribute("transform", `translate(${view.x} ${view.y}) scale(${view.scale})`);
      const ropePoints = [...pose.rope];
      ropePoints[0] = { x: (measuredWidth / 2 - view.x) / view.scale, y: -view.y / view.scale };
      const d = ropePath(ropePoints);
      rope.current?.setAttribute("d", d);
      leftEdge.current?.setAttribute("d", ribbonPath(ropePoints, 1, view.scale));
      rightEdge.current?.setAttribute("d", ribbonPath(ropePoints, -1, view.scale));
      const index = Math.floor(pose.rope.length / 2);
      const middle = pose.rope[index];
      const before = pose.rope[index - 1];
      const after = pose.rope[index + 1];
      const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI - 90;
      const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
      const spread = 18 * (1 - index / (pose.rope.length - 1)) ** .8;
      const labelX = middle.x - (after.y - before.y) / length * spread;
      const labelY = middle.y + (after.x - before.x) / length * spread;
      mark.current?.setAttribute("transform", `translate(${labelX - 8} ${labelY - 8}) rotate(${angle} 8 8)`);
      card.style.transform = `translate3d(${view.x + pose.hook.x * view.scale - pose.cardWidth / 2}px,${view.y + pose.hook.y * view.scale + pose.attachment}px,0) scale(${view.scale}) rotate(${pose.angle}deg)`;
      const state = pose.dragging ? "dragging" : pose.sleeping ? "resting" : "swinging";
      if (root.dataset.physics !== state) root.dataset.physics = state;
    };
    const tick = (time) => {
      frame = 0;
      if (!mode.current.enabled || (mode.current.reduced && !simulation.pose().dragging)) return;
      if (pointer) simulation.dragTo(coordinates(pointer.last));
      simulation.step(lastTime ? time - lastTime : 1000 / 60);
      lastTime = time;
      draw();
      if (!simulation.pose().sleeping) frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame && mode.current.enabled && (!mode.current.reduced || simulation?.pose().dragging)) { lastTime = 0; frame = requestAnimationFrame(tick); }
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
    const coordinates = (event) => {
      const rect = root.getBoundingClientRect();
      return { x: (event.clientX - rect.left - view.x) / view.scale, y: (event.clientY - rect.top - view.y) / view.scale };
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
      const cardWidth = Math.max(170, Math.min(270, width * 0.7, width - 80));
      card.style.width = `${cardWidth}px`;
      simulation = createLanyardPhysics({ width, height, cardWidth, cardHeight: cardWidth / 0.7, initialSwing: !mode.current.reduced });
      draw(true); wake();
    };
    const start = (event) => {
      if (!simulation || document.hidden || event.button !== 0 || !event.isPrimary) return;
      // An explicit grab is valid even before the visibility observer has delivered.
      mode.current.enabled = true;
      pointer = { id: event.pointerId, start: coordinates(event), last: { clientX: event.clientX, clientY: event.clientY }, active: true };
      simulation.beginDrag(pointer.start);
      card.setPointerCapture(event.pointerId);
      dragCallback.current?.(true);
      event.preventDefault();
      wake();
    };
    const move = (event) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      pointer.last = { clientX: event.clientX, clientY: event.clientY };
      const point = coordinates(event);
      event.preventDefault();
      simulation.dragTo(point);
      wake();
    };
    const release = () => {
      if (!pointer) return;
      if (pointer.active) simulation.endDrag();
      pointer = null;
      dragCallback.current?.(false);
      if (mode.current.reduced) { simulation.reset(false); draw(true); stop(); return; }
      wake();
    };
    const reset = () => { release(); simulation?.reset(false); if (simulation) draw(true); stop(); };
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
    window.addEventListener("blur", release);
    controller.current = { wake, stop, reset, release, kick, isDragging: () => Boolean(simulation?.pose().dragging) };
    resize();
    return () => {
      stop(); resizeObserver.disconnect(); controller.current = null;
      card.removeEventListener("pointerdown", start);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerup", release);
      card.removeEventListener("pointercancel", release);
      card.removeEventListener("lostpointercapture", release);
      card.removeEventListener("keydown", key);
      window.removeEventListener("blur", release);
    };
  }, [stage, badge, rigging, rope, leftEdge, rightEdge, mark]);

  useEffect(() => {
    const dragging = controller.current?.isDragging();
    mode.current = { enabled: enabled || (dragging && !document.hidden), reduced };
    if (dragging && !document.hidden) controller.current?.wake();
    else if (reduced) controller.current?.reset();
    else if (enabled) controller.current?.wake();
    else { controller.current?.release(); controller.current?.stop(); }
  }, [enabled, reduced]);
  return controller;
}
