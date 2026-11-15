/** Shared class recipes so buttons/inputs stay consistent everywhere. */
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bx-ink";

export const btn = {
  primary: `inline-flex items-center justify-center gap-2 bg-bx-ink px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-black/80 disabled:opacity-40 ${focus}`,
  gold: `inline-flex items-center justify-center gap-2 bg-bx-ink px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-black/80 disabled:opacity-40 ${focus}`,
  outline: `inline-flex items-center justify-center gap-2 border border-bx-ink px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-bx-ink hover:bg-bx-ink hover:text-white ${focus}`,
  outlineLight: `inline-flex items-center justify-center gap-2 border border-white px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-white hover:text-bx-ink ${focus}`,
  icon: `inline-flex h-10 w-10 items-center justify-center text-bx-ink hover:opacity-60 ${focus}`,
};

export const field = {
  label: "mb-1.5 block text-[13px] font-medium text-bx-ink",
  input:
    "w-full border border-bx-line bg-white px-3.5 py-3 text-base text-bx-ink placeholder:text-bx-muted/70 focus:border-bx-ink focus:outline-none",
  hint: "mt-1 text-xs text-bx-muted",
  error: "mt-1 text-xs text-bx-ruby",
};

export const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
