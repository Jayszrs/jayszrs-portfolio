export default function SiteFooter() {
  return (
    <footer className="section-pad pb-10 pt-14">
      <div className="mx-auto max-w-6xl border-t border-line pt-7 text-center font-mono text-xs text-muted">
        &copy; {new Date().getFullYear()} jayszrs
      </div>
    </footer>
  );
}
