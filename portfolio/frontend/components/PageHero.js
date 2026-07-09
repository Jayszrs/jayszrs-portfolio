import Link from "next/link";
import { ArrowLeft, ArrowDownRight } from "lucide-react";

const accents = {
  emerald: "from-emerald/15 via-emerald/5 to-transparent",
  gold: "from-gold/15 via-gold/5 to-transparent",
  ink: "from-ink/10 via-ink/[0.03] to-transparent",
};

export default function PageHero({ eyebrow, title, description, accent = "emerald", count }) {
  return (
    <section className="section-pad pt-32">
      <div className={`relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br ${accents[accent]} px-7 py-12 shadow-glass sm:px-12 sm:py-16`}>
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/70 bg-white/30" />
        <div className="relative max-w-3xl">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-emerald">
            <ArrowLeft size={15} /> Kembali ke beranda
          </Link>
          <div className="flex items-center gap-3">
            <p className="eyebrow">{eyebrow}</p>
            {count !== undefined && (
              <span className="rounded-full bg-white/70 px-2.5 py-1 font-mono text-[10px] text-ink/55">{count} item</span>
            )}
          </div>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</p>
        </div>
        <ArrowDownRight className="absolute bottom-8 right-8 hidden text-ink/20 sm:block" size={42} />
      </div>
    </section>
  );
}
