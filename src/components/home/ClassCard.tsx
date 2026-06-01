import { Volleyball } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TeamWithCount } from '@/services/class-service'
import { pluralize } from '@/lib/format'

interface ClassCardProps {
  team: TeamWithCount
  selected: boolean
  onSelect: () => void
}

/**
 * Turma card for the Home screen.
 * Matches the `.er-turma` mockup: 16px padding, 16px radius, shadow-md,
 * green-50 icon square, name+meta middle, time/level right column.
 */
export function ClassCard({ team, selected, onSelect }: ClassCardProps) {
  const timeLabel = team.schedule_time
    ? team.schedule_time.slice(0, 5) // "18:30:00" -> "18:30"
    : null

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-[16px] border-2 bg-surface p-4 text-left shadow-md transition-colors',
        selected ? 'border-green-500' : 'border-transparent',
      )}
    >
      {/* Icon dot */}
      <div className="flex size-[46px] shrink-0 items-center justify-center rounded-[13px] bg-green-50 text-green-600">
        <Volleyball size={24} />
      </div>

      {/* Middle: name + meta */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[17px] font-extrabold text-fg-1">
          {team.name}
        </div>
        <div className="mt-0.5 truncate text-[12.5px] text-fg-3">
          {[team.branch_name, team.schedule_days, pluralize(team.student_count, 'aluno', 'alunos')]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>

      {/* Right column: time + level tag */}
      <div className="shrink-0 text-right">
        {timeLabel && (
          <span className="font-num text-[17px] font-black text-green-600">{timeLabel}</span>
        )}
        {team.level && (
          <span className="block text-[10px] font-semibold tracking-wide text-fg-4">
            {team.level}
          </span>
        )}
      </div>
    </button>
  )
}
