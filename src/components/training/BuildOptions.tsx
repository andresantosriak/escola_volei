import { SlidersHorizontal } from 'lucide-react'
import { Segmented } from '@/components/ui/tabs'
import type { AssemblyMode, BenchPolicy } from '@/engine'

interface BuildOptionsProps {
  mode: AssemblyMode
  size: number
  benchPolicy: BenchPolicy
  onModeChange: (m: AssemblyMode) => void
  onSizeChange: (s: number) => void
  onBenchPolicyChange: (b: BenchPolicy) => void
}

export function BuildOptions({
  mode,
  size,
  benchPolicy,
  onModeChange,
  onSizeChange,
  onBenchPolicyChange,
}: BuildOptionsProps) {
  return (
    <div className="bg-surface shadow-md" style={{ borderRadius: 16, padding: '12px 14px' }}>
      {/* Title row */}
      <div className="flex items-center gap-[7px]" style={{ marginBottom: 10 }}>
        <SlidersHorizontal size={16} className="shrink-0 text-fg-3" />
        <span className="font-display text-[13px] font-extrabold text-fg-1">
          Opções de montagem
        </span>
      </div>

      {/* Mode selector */}
      <div style={{ marginBottom: 9 }}>
        <Segmented
          value={mode}
          onChange={(v) => onModeChange(v as AssemblyMode)}
          options={[
            { value: 'competitive', label: 'Competitivo' },
            { value: 'development', label: 'Desenvolvimento' },
          ]}
        />
      </div>

      {/* Size + Bench selectors side by side */}
      <div className="flex gap-[9px]">
        <div className="flex-1">
          <Segmented
            value={size === 7 ? '7' : '6'}
            onChange={(v) => onSizeChange(Number(v))}
            options={[
              { value: '6', label: '6×6' },
              { value: '7', label: '7×7' },
            ]}
          />
        </div>
        <div className="flex-1">
          <Segmented
            value={benchPolicy}
            onChange={(v) => onBenchPolicyChange(v as BenchPolicy)}
            options={[
              { value: 'bench', label: 'Banco' },
              { value: 'rotation', label: 'Rodízio' },
            ]}
          />
        </div>
      </div>

      {/* Mode description */}
      <p className="mt-[9px] px-0.5 font-body text-[11px] leading-[1.4] text-fg-4">
        {mode === 'development'
          ? 'Desenvolvimento: cada time recebe mentor + aprendiz. Prioriza a mistura de níveis sobre o placar exato.'
          : 'Competitivo: busca o jogo mais parelho possível (menor diferença de força e por fundamento).'}
      </p>
    </div>
  )
}
