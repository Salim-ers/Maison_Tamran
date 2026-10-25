/** Classes partagées du back-office (plus denses que celles du site public). */
export const inputCls =
  "block w-full min-h-10 rounded-[2px] border border-line bg-cream px-3 py-2 text-sm leading-snug transition-colors hover:border-ink/30 focus:border-chocolate focus:outline-none focus:ring-1 focus:ring-chocolate aria-[invalid=true]:border-danger disabled:opacity-60";
export const labelCls = "mb-1 block text-[0.8125rem] font-medium";
export const hintCls = "mt-1 text-xs leading-snug text-ink-soft";

const btnBase =
  "inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[2px] px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btnBase} bg-chocolate text-ivory hover:bg-[#3c2d27]`;
export const btnSecondary = `${btnBase} border border-ink/25 bg-cream hover:border-chocolate hover:bg-ivory`;
export const btnDanger = `${btnBase} border border-danger/40 bg-cream text-danger hover:bg-danger hover:text-cream`;
export const btnGhost = `${btnBase} px-2 text-ink-soft hover:bg-ink/5 hover:text-ink`;
export const btnSmall = "min-h-7 px-2.5 text-xs";
