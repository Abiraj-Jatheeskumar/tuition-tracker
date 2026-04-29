/**
 * Stylish page header strip used across dashboard routes (desktop + mobile).
 */
export default function PageHero({ eyebrow, title, subtitle, hint }) {
  return (
    <div className="tt-page-hero relative mb-8 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(91,97,232,0.28)_0%,transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(22,129,95,0.22)_0%,transparent_70%)] blur-2xl"
      />
      <div className="relative z-[1]">
        {eyebrow ? (
          <p className="tt-page-hero-eyebrow font-display text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-[var(--accent-bright)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="tt-heading mt-2">{title}</h1>
        {subtitle ? <p className="tt-sub">{subtitle}</p> : null}
        {hint ? (
          <p className="mt-4 max-w-2xl text-[0.8125rem] leading-relaxed text-[var(--muted)]">{hint}</p>
        ) : null}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(26,122,92,0.25)] to-transparent"
      />
    </div>
  );
}
