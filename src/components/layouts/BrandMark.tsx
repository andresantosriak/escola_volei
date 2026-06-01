/**
 * BrandMark — logo-mark + wordmark "ESPORTE / RECREAÇÃO".
 *
 * Replicates the `.er-brandrow` from the design-system mockup.
 * Used in Home and Menu headers.
 *
 * Usage:
 *   <BrandMark />                  — default compact size (34px mark)
 *   <BrandMark size={40} />        — custom mark size
 *   <BrandMark className="mb-2" /> — extra Tailwind classes on wrapper
 */
interface BrandMarkProps {
  /** Diameter of the logo circle in px (default 34) */
  size?: number
  /** Extra classes for the outer wrapper */
  className?: string
  /** 'default' (sobre fundo claro) ou 'on-dark' (wordmark branco, p/ card de share) */
  tone?: 'default' | 'on-dark'
}

export function BrandMark({ size = 34, className, tone = 'default' }: BrandMarkProps) {
  const onDark = tone === 'on-dark'
  return (
    <div
      className={`flex items-center gap-2.5 px-[18px] py-1${className ? ` ${className}` : ''}`}
    >
      {/* Inline SVG — volleyball mark from design-system/assets/logo-mark.svg */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Esporte Recreação"
        className="shrink-0"
      >
        <circle cx="60" cy="60" r="52" fill="var(--color-green-500, #009C3B)" />
        <g fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round">
          <path d="M60 9 C 49 33, 49 87, 60 111" />
          <path d="M16 38 C 40 52, 44 84, 33 106" />
          <path d="M104 38 C 80 52, 76 84, 87 106" />
        </g>
        <circle cx="60" cy="60" r="7" fill="#FFC400" />
      </svg>

      {/* Wordmark: two-line stacked */}
      <span
        className={`font-display font-black uppercase leading-[0.95]${onDark ? ' text-white' : ''}`}
        style={{ fontSize: 13, letterSpacing: '0.01em' }}
      >
        <small
          className={`block font-bold${onDark ? ' text-white/80' : ' text-green-600'}`}
          style={{ fontSize: 8.5, letterSpacing: '0.18em' }}
        >
          Esporte
        </small>
        Recreação
      </span>
    </div>
  )
}
