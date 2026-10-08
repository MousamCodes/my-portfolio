/**
 * Monogram mark: a black "M" whose tops flare out like bat wings,
 * on a violet → cyan gradient tile. Same artwork as app/icon.svg.
 */
export const LOGO_PATH =
  "M2.5 8.5 C6.5 8.5 9 10 10.6 12.6 C12.6 13.4 14.6 15.6 16 18.4 C17.4 15.6 19.4 13.4 21.4 12.6 C23 10 25.5 8.5 29.5 8.5 L25.3 25 H21.3 V17.2 L16 23.2 L10.7 17.2 V25 H6.7 Z";

export default function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8b7cff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#logo-bg)" />
      <path d={LOGO_PATH} fill="#07070a" />
    </svg>
  );
}
