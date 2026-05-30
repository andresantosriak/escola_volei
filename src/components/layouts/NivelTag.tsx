import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  Iniciante: 'bg-green-50 text-green-700',
  Intermediário: 'bg-[#FFF0DD] text-[#A85A00]',
  Avançado: 'bg-[#E6ECFB] text-ink-700',
}

export function NivelTag({ level }: { level: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STYLES[level] ?? STYLES.Iniciante)}>
      {level}
    </span>
  )
}
