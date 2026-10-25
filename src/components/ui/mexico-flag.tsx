/** Bandera de México en círculo (el escudo va simplificado para que se lea a tamaño pequeño). */
export function MexicoFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label="México" className={className}>
      <defs>
        <clipPath id="mx-flag">
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath="url(#mx-flag)">
        <rect width="8" height="24" fill="#006847" />
        <rect x="8" width="8" height="24" fill="#ffffff" />
        <rect x="16" width="8" height="24" fill="#ce1126" />
        <ellipse cx="12" cy="12.4" rx="2.3" ry="2.6" fill="#8c6a3b" />
        <path d="M9.6 14.6c1.4 1.3 3.4 1.3 4.8 0" fill="none" stroke="#006847" strokeWidth="0.9" />
        <circle cx="12" cy="9.9" r="0.9" fill="#8c6a3b" />
      </g>
      <circle cx="12" cy="12" r="11.6" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
    </svg>
  );
}
