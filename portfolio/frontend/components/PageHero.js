import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHero({ eyebrow, title, description, count }) {
  return (
    <section className="page-intro section-pad pt-28 sm:pt-32" aria-label={eyebrow || undefined}>
      <div className="relative mx-auto max-w-7xl border-b border-line/80 pb-8 sm:pb-11">
        <Link href="/" prefetch={false} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted underline-offset-4 transition hover:text-ink hover:underline"><ArrowLeft size={15} />Kembali ke beranda</Link>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="max-w-3xl text-balance font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-ink">{title}</h1>
          {count !== undefined && <span className="rounded-full border border-line bg-surface/60 px-3.5 py-2 text-xs tabular-nums text-muted">{count} item</span>}
        </div>
        {description && <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}
