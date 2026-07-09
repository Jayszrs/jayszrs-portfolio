"use client";

import { motion } from "framer-motion";

export default function Experience({ items }) {
  return (
    <section id="pengalaman" className="section-pad py-24">
      <div className="mx-auto max-w-4xl">
        <p className="eyebrow">Rekam Jejak</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Pengalaman & Volunteer
        </h2>

        <div className="relative mt-12 space-y-6 border-l border-line pl-8">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className="glass relative rounded-2xl p-5"
            >
              <span className="absolute -left-[2.55rem] top-6 h-3 w-3 rounded-full bg-emerald ring-4 ring-emerald-soft" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-emerald-deep">
                  {item.type}
                </span>
                <span className="font-mono text-xs text-muted">{item.period}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">{item.title}</h3>
              <p className="text-sm font-medium text-emerald-deep">{item.org}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
