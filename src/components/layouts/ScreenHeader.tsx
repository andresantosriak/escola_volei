import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { IconButton } from './IconButton'

interface ScreenHeaderProps {
  /** Large title (Archivo extrabold ~27px) */
  title: string
  /** Subtitle line below title (font-body text-sm text-fg-3) */
  subtitle?: string
  /** Right-aligned element (IconButton, text button, etc.) */
  right?: ReactNode
  /** Show back chevron on the left */
  back?: boolean
  /** Custom back handler (defaults to navigate(-1)) */
  onBack?: () => void
  /** Show BrandMark above the title (Home, Menu) */
  brand?: boolean
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  back,
  onBack,
  brand,
}: ScreenHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="bg-app pt-5 px-[18px] pb-3">
      {brand && <BrandMark className="mb-1 -ml-[18px]" />}

      <div className="flex items-start gap-2">
        {back && (
          <IconButton
            icon={ChevronLeft}
            label="Voltar"
            variant="white"
            onClick={onBack ?? (() => navigate(-1))}
            className="mt-0.5"
          />
        )}

        <div className="min-w-0 flex-1">
          <h1 className="q-h1 text-fg-1">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 font-body text-[13px] font-medium text-fg-3">
              {subtitle}
            </p>
          )}
        </div>

        {right && <div className="shrink-0 pt-0.5">{right}</div>}
      </div>
    </header>
  )
}
