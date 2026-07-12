"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Education = dynamic(() => import("@/frontend/components/Education"), { ssr: false });
const Capabilities = dynamic(() => import("@/frontend/components/Capabilities"), { ssr: false });
const Experience = dynamic(() => import("@/frontend/components/Experience"), { ssr: false });
const Gallery = dynamic(() => import("@/frontend/components/Gallery"), { ssr: false });
const SelectedDesigns = dynamic(() => import("@/frontend/components/SelectedDesigns"), { ssr: false });
const Ratings = dynamic(() => import("@/frontend/components/Ratings"), { ssr: false });
const Achievements = dynamic(() => import("@/frontend/components/Achievements"), { ssr: false });
const Contact = dynamic(() => import("@/frontend/components/Contact"), { ssr: false });

function SectionShell({ id, minHeight = 420, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div id={id} ref={ref} className={id ? "scroll-mt-28" : undefined} style={!visible ? { minHeight } : undefined}>
      {visible ? children : null}
    </div>
  );
}

export default function LazyHomeSections({ content }) {
  return (
    <>
      <SectionShell minHeight={520}>
        <Education items={content.education} section={content.sections.education} />
      </SectionShell>
      <SectionShell minHeight={620}>
        <Capabilities capabilities={content.capabilities} section={content.sections.capabilities} />
      </SectionShell>
      <SectionShell minHeight={560}>
        <Experience items={content.experience} section={content.sections.experience} />
      </SectionShell>
      <SectionShell minHeight={480}>
        <Gallery items={content.gallery} section={content.sections.gallery} />
      </SectionShell>
      <SectionShell minHeight={480}>
        <SelectedDesigns items={content.selectedDesigns} section={content.sections.selectedDesigns} />
      </SectionShell>
      <SectionShell minHeight={520}>
        <Achievements achievements={content.achievements} certificates={content.certificates} section={content.sections.achievements} />
      </SectionShell>
      <SectionShell id="rating" minHeight={480}>
        <Ratings items={content.ratings} section={content.sections.ratings} />
      </SectionShell>
      <SectionShell minHeight={440}>
        <Contact contact={content.contact} profile={content.profile} section={content.sections.contact} />
      </SectionShell>
    </>
  );
}
