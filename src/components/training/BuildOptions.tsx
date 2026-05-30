import { Segmented } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import type { AssemblyMode } from '@/engine'

interface BuildOptionsProps {
  mode: AssemblyMode
  size: number
  onModeChange: (m: AssemblyMode) => void
  onSizeChange: (s: number) => void
}

const SIZE_OPTIONS = [
  { value: '2', label: '2x2' },
  { value: '3', label: '3x3' },
  { value: '4', label: '4x4' },
  { value: '5', label: '5x5' },
  { value: '6', label: '6x6' },
  { value: '7', label: '7x7' },
]

export function BuildOptions({ mode, size, onModeChange, onSizeChange }: BuildOptionsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-1 bg-surface p-3">
      <div>
        <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Modo de montagem</p>
        <Segmented
          value={mode}
          onChange={(v) => onModeChange(v as AssemblyMode)}
          options={[
            { value: 'competitive', label: 'Competitivo' },
            { value: 'development', label: 'Desenvolvimento' },
          ]}
        />
      </div>
      <div>
        <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Tamanho do time</p>
        <Select
          value={String(size)}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          options={SIZE_OPTIONS}
        />
      </div>
    </div>
  )
}
