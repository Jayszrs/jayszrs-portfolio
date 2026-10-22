"use client";

import { useEffect, useRef } from "react";
import OrganizationLogo from "./OrganizationLogo";
import useDragScroll from "@/frontend/lib/useDragScroll";

function website(value) {
  try {
    const url = new URL(/^https?:\/\//i.test(value || '') ? value : `https://${value}`);
    return ['https:', 'http:'].includes(url.protocol) && value ? url.href : null;
  } catch { return null; }
}

export default function Collaborations({ items = [] }) {
  const track = useRef(null);
  const group = useRef(null);
  const paused = useRef({ hover: false, focus: false, pointer: false, until: 0 });
  const playback = useRef(null);
  const pause = (key, value) => { paused.current[key] = value; playback.current?.(); };
  const logos = items.filter(item => item && item.name && item.logo);
  useDragScroll(track);
  useEffect(() => {
    const node = track.current, primary = group.current;
    if (!node || !primary) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, visible = false, frame = 0, last = 0, position = 0, initialized = false, timer = 0;
    const stop = () => { cancelAnimationFrame(frame); clearTimeout(timer); frame = 0; timer = 0; last = 0; };
    const blocked = () => !visible || document.hidden || motion.matches || document.documentElement.dataset.dialogOpen === 'true' || document.documentElement.dataset.scrollActive === 'true' || paused.current.hover || paused.current.focus || paused.current.pointer || performance.now() < paused.current.until;
    const tick = time => {
      frame = 0;
      if (blocked() || width <= 0) { sync(); return; }
      if (!last) { position = node.scrollLeft; last = time; }
      position += Math.min(40, time - last) * .025;
      if (position >= width * 2) position -= width;
      node.scrollLeft = position;
      last = time;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      stop();
      if (!blocked() && width > 0) frame = requestAnimationFrame(tick);
      else if (visible && !document.hidden && !motion.matches && paused.current.until > performance.now()) timer = setTimeout(sync, paused.current.until - performance.now() + 20);
    };
    playback.current = sync;
    const resize = new ResizeObserver(() => {
      width = primary.getBoundingClientRect().width;
      if (!initialized && width > 0) { node.scrollLeft = width; initialized = true; }
      position = node.scrollLeft;
      sync();
    });
    resize.observe(primary);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node);
    document.addEventListener('visibilitychange', sync);
    document.addEventListener('portfolio:dialogchange', sync);
    document.addEventListener('portfolio:scrollactivity', sync);
    const release = () => { paused.current.pointer = false; sync(); };
    window.addEventListener('pointerup', release);
    window.addEventListener('blur', release);
    motion.addEventListener('change', sync);
    return () => { stop(); playback.current = null; observer.disconnect(); resize.disconnect(); document.removeEventListener('visibilitychange', sync); document.removeEventListener('portfolio:dialogchange', sync); document.removeEventListener('portfolio:scrollactivity', sync); window.removeEventListener('pointerup', release); window.removeEventListener('blur', release); motion.removeEventListener('change', sync); };
  }, [items]);
  if (!logos.length) return null;
  const examples = logos.some(item => item.status !== 'collaboration');
  const allExamples = logos.every(item => item.status !== 'collaboration');
  return <section className="collaborations section-pad py-14 sm:py-20" aria-labelledby="collaborations-heading">
    <div className="mx-auto max-w-7xl">
      <div className="collaborations-heading"><h2 id="collaborations-heading">{allExamples ? 'Ruang untuk kolaborasi.' : 'Kolaborasi.'}</h2><p>{examples ? 'Logo bertanda Contoh digunakan untuk pratinjau tampilan.' : 'Merek dan organisasi yang pernah berkolaborasi dengan saya.'}</p></div>
      <div ref={track} className="collaboration-track mouse-scroll-track" tabIndex={0} role="region" aria-label="Logo kolaborasi, geser dengan mouse atau tombol panah"
        onPointerEnter={event => { if (event.pointerType === 'mouse') pause('hover', true); }} onPointerLeave={() => pause('hover', false)}
        onPointerDown={() => pause('pointer', true)} onPointerUp={() => pause('pointer', false)} onPointerCancel={() => pause('pointer', false)} onLostPointerCapture={() => pause('pointer', false)}
        onFocusCapture={() => pause('focus', true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) pause('focus', false); }} onWheelCapture={() => pause('until', performance.now() + 1800)}
        onKeyDown={event => { if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); pause('until', performance.now() + 1800); event.currentTarget.scrollBy({ left: event.key === 'ArrowRight' ? 180 : -180, behavior: 'auto' }); }}>
        {[0, 1, 2].map(copy => <div key={copy} ref={copy === 1 ? group : undefined} className="collaboration-group" aria-hidden={copy === 1 ? undefined : true}>
          {logos.map((item, index) => {
            const url = website(item.url);
            const content = <><OrganizationLogo src={item.logo} alt={copy === 1 ? `Logo ${item.name}` : ''} appearance={item.appearance || 'auto'} sizes="140px" className="h-16 w-32" imgClassName="object-contain" /><span className="collaboration-caption" data-no-translate>{item.name}</span>{item.status !== 'collaboration' && <span className="collaboration-example">Contoh</span>}</>;
            return url ? <a key={item.id || index} href={url} target="_blank" rel="noreferrer" tabIndex={copy === 1 ? 0 : -1} className="collaboration-logo">{content}</a> : <div key={item.id || index} className="collaboration-logo">{content}</div>;
          })}
        </div>)}
      </div>
    </div>
  </section>;
}
