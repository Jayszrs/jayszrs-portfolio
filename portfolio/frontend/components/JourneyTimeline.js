"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, GraduationCap } from "lucide-react";
import OrganizationLogo from "./OrganizationLogo";
import { LogoFallback } from "./SafeImage";
import { buildJourney } from "@/frontend/lib/journey.cjs";

export default function JourneyTimeline({ education = [], experience = [] }) {
  const root = useRef(null);
  const rows = useMemo(() => buildJourney(education, experience), [education, experience]);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const cards = [...node.querySelectorAll('[data-journey-card]')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, frame = 0;
    const update = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const box = node.getBoundingClientRect(), height = innerHeight;
      const rects = cards.map(card => card.getBoundingClientRect());
      const progress = motion.matches ? 1 : Math.max(0, Math.min(1, (height * .7 - box.top) / Math.max(1, box.height - height * .3)));
      node.style.setProperty('--journey-progress', progress.toFixed(4));
      cards.forEach((card, index) => {
        const rect = rects[index];
        const offset = motion.matches ? 0 : Math.max(-12, Math.min(12, (rect.top - height * .45) * -.035));
        card.style.setProperty('--journey-offset', `${offset.toFixed(2)}px`);
        card.dataset.reached = String(rect.top < height * .72);
      });
    };
    const schedule = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); }, { rootMargin: '100px' });
    observer.observe(node);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', schedule);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); document.removeEventListener('visibilitychange', schedule); motion.removeEventListener('change', schedule); };
  }, [rows]);
  if (!rows.length) return null;
  return <section ref={root} id="perjalanan" className="journey section-pad py-14 sm:py-20" aria-labelledby="journey-heading">
    <div className="mx-auto max-w-6xl">
      <div className="journey-heading"><h2 id="journey-heading">Perjalanan saya.</h2><p>Pendidikan dan pengalaman yang membentuk cara saya berkarya.</p></div>
      <div className="journey-list"><div className="journey-rail" aria-hidden="true"><span /></div>
        <ol>{rows.map(row => {
          const Icon = row.kind === 'education' ? GraduationCap : BriefcaseBusiness;
          return <li key={row.id} className="journey-row" data-journey-id={row.id}>
            <div className="journey-year" data-no-translate={row.date ? '' : undefined}>{row.date?.year || 'Kini'}</div>
            <span className="journey-dot" aria-hidden="true" />
            <article className="journey-card" data-journey-card>
              <div className="journey-card-top"><span className="flex items-center gap-2"><Icon size={14} />{row.label}</span><span>{row.dateLabel}</span></div>
              <div className="journey-identity">
                {row.logo && <OrganizationLogo src={row.logo} alt={`Logo ${row.organization || row.title}`} sizes="64px" className="h-14 w-16 shrink-0" imgClassName="object-contain" fallback={<LogoFallback label={row.organization || row.title} icon={Icon} />} />}
                <div><h3>{row.title}</h3><p>{row.organization}</p></div>
              </div>
              {row.description && <p className="journey-description">{row.description}</p>}
              <Link href={row.href} prefetch={false} className="journey-link">{row.kind === 'education' ? 'Lihat pendidikan' : 'Lihat pengalaman'}<ArrowUpRight size={14} /></Link>
            </article>
          </li>;
        })}</ol>
      </div>
    </div>
  </section>;
}
