const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IconSearch = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>
);
export const IconUser = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
);
export const IconBag = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><path d="M4.5 8h15l-1.2 12.5H5.7z" /><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" /></svg>
);
export const IconClose = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><path d="M5 5l14 14M19 5 5 19" /></svg>
);
export const IconArrow = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
export const IconInstagram = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" /></svg>
);
export const IconPinterest = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><circle cx="12" cy="12" r="9" /><path d="M10.5 20.5 12.4 12.6M11 15.5c.8.9 2 1.2 3.2.8 2-.8 2.8-3.4 1.8-5.5-1.1-2.3-4.4-3-6.5-1.5-1.6 1.2-1.9 3.4-.9 4.8" /></svg>
);
export const IconLinkedin = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={p.className} {...base}><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M8 10.5V16M8 7.8v.1M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.3-2.6s2.2.9 2.2 2.6V16" /></svg>
);
