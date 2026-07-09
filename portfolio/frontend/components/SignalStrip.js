export default function SignalStrip({ roles = [] }) {
  const items = [...roles, "Available for collaboration", "Bekasi · Indonesia"];
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-ink py-4 text-white">
      <div className="flex w-max animate-marquee items-center">
        {loop.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center">
            <span className="mx-6 font-mono text-xs uppercase tracking-[0.22em] text-white/75 sm:mx-10">{item}</span>
            <span className="h-2 w-2 bg-[#24e58a]" />
          </div>
        ))}
      </div>
    </div>
  );
}
