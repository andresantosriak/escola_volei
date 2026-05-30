import { cn } from '@/lib/utils'

interface SetScoreRowProps {
  index: number
  pointsA: number
  pointsB: number
}

export function SetScoreRow({ index, pointsA, pointsB }: SetScoreRowProps) {
  const aWin = pointsA > pointsB
  const bWin = pointsB > pointsA
  return (
    <div className="flex items-center justify-between border-b border-border-1 py-2 last:border-0">
      <span className="font-body text-xs font-semibold text-fg-3">Set {index}</span>
      <div className="flex items-center gap-3 font-stat text-lg font-bold tabular-nums">
        <span className={cn(aWin ? 'text-green-700' : 'text-fg-3')}>{pointsA}</span>
        <span className="text-xs text-fg-4">×</span>
        <span className={cn(bWin ? 'text-green-700' : 'text-fg-3')}>{pointsB}</span>
      </div>
    </div>
  )
}
