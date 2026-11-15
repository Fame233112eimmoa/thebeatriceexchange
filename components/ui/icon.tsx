import type { SVGProps } from "react";

import type { CategoryIcon } from "../../lib/types";

/** Original 24×24 line icons (1.5px stroke). */
const paths: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z" />,
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  phone: <path d="M6.6 3.5h2.6l1.3 4.2-1.9 1.4a11.5 11.5 0 0 0 6.3 6.3l1.4-1.9 4.2 1.3v2.6a2 2 0 0 1-2.2 2C10.4 18.9 5.1 13.6 4.6 5.7a2 2 0 0 1 2-2.2Z" />,
  message: <path d="M4.5 5.5h15v10h-9l-4.5 3.5v-3.5h-1.5v-10Z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.8" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronDown: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  chevronLeft: <path d="m14.5 6-6 6 6 6" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  arrowRight: <path d="M4.5 12h15m-5.5-5.5L19.5 12 14 17.5" />,
  star: <path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8L12 3.8Z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  shield: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6l7-2.5Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  bolt: <path d="M13.5 3 5.5 13.5h6L10.5 21l8-10.5h-6L13.5 3Z" />,
  scale: (
    <>
      <path d="M12 4v16M7 20h10M5 7h14" />
      <path d="m5 7-2.5 6a2.5 2.5 0 0 0 5 0L5 7Zm14 0-2.5 6a2.5 2.5 0 0 0 5 0L19 7Z" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3.5 3.5l17 17" />
      <path d="M10 6a8.6 8.6 0 0 1 2-.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.2 7.6C3.9 9.3 2.5 12 2.5 12S6 18.5 12 18.5a8.7 8.7 0 0 0 3.6-.8" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="m9 14.3-1.5 6.2L12 18l4.5 2.5-1.5-6.2" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11v9.5H3zM14 9.5h4l3 3.2V16h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.5V20h16V9.5" />
      <path d="M3 9.5 5 4h14l2 5.5a2.6 2.6 0 0 1-4.5 1.6 2.6 2.6 0 0 1-4.5 0 2.6 2.6 0 0 1-4.5 0A2.6 2.6 0 0 1 3 9.5Z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  grid: <path d="M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z" />,
  list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.5M4.5 12h.5M4.5 17.5h.5" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  upload: <path d="M12 15.5V4.5m-4.5 4.5L12 4.5 16.5 9M5 15v4.5h14V15" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M5 7h14M10 7V4.5h4V7m-7.5 0 1 13h7l1-13" />,
  gift: (
    <>
      <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13" />
      <path d="M12 7c-1.5-3.5-5.5-3.5-5 0M12 7c1.5-3.5 5.5-3.5 5 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="m4 6.5 8 6 8-6" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4.5v4h4" />
      <path d="M12 8v4.2l2.8 1.8" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="1.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  idCard: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 15.5c.6-1.4 1.7-2 3-2s2.4.6 3 2M14 10h4.5M14 13.5h3" />
    </>
  ),
  sparkle: <path d="M12 3.5 13.8 10l6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2L12 3.5Z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r=".6" fill="currentColor" />
    </>
  ),
  facebook: <path d="M13.5 20.5v-7h2.4l.4-2.8h-2.8V8.9c0-.8.3-1.4 1.4-1.4h1.5V5a17 17 0 0 0-2.2-.1c-2.2 0-3.6 1.3-3.6 3.7v2.1H8.2v2.8h2.4v7" />,
  tiktok: <path d="M14 4v10.5a3.3 3.3 0 1 1-3.3-3.3M14 4c.3 2.4 1.9 4 4.5 4.3" />,

  watch: (
    <>
      <rect x="6.5" y="7" width="11" height="10" rx="3" />
      <path d="m9 7 .6-3.5h4.8L15 7M9 17l.6 3.5h4.8L15 17M12 9.8V12l1.6 1.1" />
    </>
  ),
  // Category icons
  ring: (
    <>
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="m9.5 6.5 1-2.5h3l1 2.5L12 9.2 9.5 6.5Z" />
    </>
  ),
  bullion: (
    <>
      <path d="M3 18.5 5 14h6l2 4.5H3ZM11 18.5l2-4.5h6l2 4.5H11ZM7 13.5l2-4.5h6l2 4.5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 9.5v5M10.5 10.5h2.2a1 1 0 0 1 0 2h-1.4a1 1 0 0 0 0 2h2.2" />
    </>
  ),
  handbag: (
    <>
      <path d="M4.5 10h15l-1.5 9.5h-12L4.5 10Z" />
      <path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2" />
      <path d="M10.5 13.5h3" />
    </>
  ),
  shirt: (
    <>
      <path d="M9 4.5 4 7l1.5 4 2.5-1V19.5h8V10l2.5 1L20 7l-5-2.5" />
      <path d="M9 4.5a3 3 0 0 0 6 0" />
    </>
  ),
  laptop: (
    <>
      <rect x="5" y="5" width="14" height="10" rx="1" />
      <path d="M3 18.5h18l-1.5-3.5h-15L3 18.5Z" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.5 8h9a4 4 0 0 1 4 4.2l-.4 3.6a2 2 0 0 1-3.5 1L15 15H9l-1.6 1.8a2 2 0 0 1-3.5-1l-.4-3.6A4 4 0 0 1 7.5 8Z" />
      <path d="M8 10.5v3M6.5 12h3M15.5 11h.01M17 13h.01" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="1.2" />
      <path d="M8.5 20h7M12 17v3" />
    </>
  ),
  guitar: (
    <>
      <path d="m14 10 5.5-5.5M18 3.5l2.5 2.5" />
      <path d="M13 9.5a3 3 0 0 0-3.4.4c-.8.8-.7 1.7-1.5 2.1-.9.5-2.3.1-3.2 1-1.6 1.6-.9 4.6 1 6.4 1.9 1.9 4.8 2.6 6.4 1 .9-.9.5-2.3 1-3.2.4-.8 1.3-.7 2.1-1.5a3 3 0 0 0 .4-3.4" />
      <circle cx="10.5" cy="15" r="1.3" />
    </>
  ),
  camera: (
    <>
      <path d="M3.5 8.5h4l1.5-2.5h6l1.5 2.5h4V19h-17V8.5Z" />
      <circle cx="12" cy="13.5" r="3.3" />
    </>
  ),
  drill: (
    <>
      <path d="M4 6.5h11v5H4zM15 8h3.5M18.5 9h3" />
      <path d="M7 11.5 6 20h4.5l.5-8.5" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="15.5" r="3.5" />
      <circle cx="18" cy="15.5" r="3.5" />
      <path d="M6 15.5 9.5 8h6L18 15.5M9.5 8 12 15.5l3.5-7.5M8.5 6h3M15 6h2.5" />
    </>
  ),
};

export type IconName = keyof typeof paths | CategoryIcon;

export function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.5,
  filled = false,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number; filled?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
