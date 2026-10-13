/**
 * Monogram mark: a clean white "M" on a black tile with a white outline.
 * Same artwork as app/icon.svg.
 */
export default function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" fill="#000000" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M8.5 22.5V9.5L16 17l7.5-7.5v13" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
