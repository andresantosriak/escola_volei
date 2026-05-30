import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  ctaLabel?: string
  onCta?: () => void
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-50 text-green-500">
        <Icon size={30} />
      </div>
      <h3 className="q-h3 mb-1">{title}</h3>
      <p className="mb-5 max-w-[260px] font-body text-sm text-fg-3">{description}</p>
      {ctaLabel && onCta && (
        <Button onClick={onCta}>
          <Plus size={19} />
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
