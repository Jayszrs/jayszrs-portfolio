"use client";

export default function About({ about, section = {} }) {
  return (
    <section id="tentang" className="section-pad py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">
          {section.eyebrow || "Tentang"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-5xl">
          {about.heading}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-muted"
              >
                {p}
              </p>
            ))}
          </div>

          <div className="glass rounded-2xl p-5 sm:p-6 lg:col-span-2">
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
          </div>
        </div>
      </div>
    </section>
  );
}
