import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHero({ eyebrow, title, description, count }) {
  return (
    <section className="section-pad pt-28 sm:pt-32" aria-label={eyebrow || undefined}>
      <div className="glass-strong relative mx-auto max-w-7xl rounded-3xl px-6 py-8 sm:px-12 sm:py-12">
        <Link href="/" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted underline-offset-4 transition hover:text-ink hover:underline"><ArrowLeft size={15} />Kembali ke beranda</Link>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="max-w-3xl text-balance font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-tight tracking-[-0.025em] text-ink">{title}</h1>
          {count !== undefined && <span className="text-sm tabular-nums text-muted">{count} item</span>}
        </div>
        {description && <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">{description}</p>}
      </div>
    </section>
  );
}
