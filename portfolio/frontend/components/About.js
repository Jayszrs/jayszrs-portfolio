"use client";

import { motion } from "framer-motion";

export default function About({ about, section = {} }) {
  return (
    <section id="tentang" className="section-pad py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="eyebrow"
        >
          {section.eyebrow || "Tentang"}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.05 }}
          className="mt-2 font-display text-3xl font-semibold text-ink sm:text-5xl"
        >
          {about.heading}
        </motion.h2>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            {about.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="text-base leading-relaxed text-muted"
              >
                {p}
              </motion.p>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-5 sm:p-6 lg:col-span-2"
          >
            <p className="eyebrow mb-4">{section.skillsEyebrow || "Fokus & Keahlian"}</p>
            <div className="flex flex-wrap gap-2">
              {about.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-medium text-ink/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
