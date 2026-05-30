import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn('animate-spin text-green-500', className)} />
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner size={32} />
      {label && <p className="font-body text-sm text-fg-3">{label}</p>}
    </div>
  )
}
