import { ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/students/Avatar'
import { POSITIONS, type PositionKey } from '@/lib/constants'

interface StudentRowProps {
  name: string
  position: string
  overall: number
  photoUrl?: string | null
  onClick: () => void
}

export function StudentRow({ name, position, overall, photoUrl, onClick }: StudentRowProps) {
  const positionLabel = POSITIONS[position as PositionKey] ?? position ?? 'Sem posicao'

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[14px] bg-surface px-3 py-2.5 text-left shadow-sm transition-transform active:scale-[0.99]"
    >
      <Avatar name={name} size={40} photoUrl={photoUrl} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-body text-[15px] font-bold text-fg-1">{name}</div>
        <div className="text-[11.5px] text-fg-4">{positionLabel}</div>
      </div>
      <span className="font-num text-[22px] font-black text-green-600">{overall}</span>
      <ChevronRight size={20} className="shrink-0 text-fg-4" />
    </button>
  )
}
