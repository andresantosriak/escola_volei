import { Scale, Blend, TriangleAlert } from 'lucide-react'
import type { BuildResult } from '@/engine'

export function BalanceIndicator({ result }: { result: BuildResult }) {
  const dev = result.mode === 'development'
  const good = dev ? result.mixed : result.score >= 80
  const color = good ? 'var(--color-bal)' : 'var(--color-warn)'

  const title = dev
    ? result.mixed
      ? 'Times mistos por nível'
      : 'Mistura incompleta'
    : good
      ? 'Times equilibrados'
      : 'Pode melhorar'

  const hint = dev
    ? result.mixed
      ? 'Cada time tem mentor + aprendiz (topo e base). O placar pode não ser exato — é esperado neste modo.'
      : 'Não deu pra misturar os níveis com os presentes de hoje. Ajuste na mão se quiser.'
    : good
      ? 'Força total e cada fundamento divididos de forma parelha.'
      : 'Um time concentra os melhores. Toque em "Reequilibrar" ou mova um aluno.'

  const Icon = dev ? Blend : good ? Scale : TriangleAlert

  return (
    // Fiel a design-system/preview/comp-equilibrio.html: bg gray-50, radius 16px, padding 16px 18px, sem borda.
    <div className="bg-gray-50" style={{ borderRadius: 16, padding: '16px 18px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <span className="flex flex-1 items-center gap-2 font-body font-bold" style={{ fontSize: 14, color: 'var(--color-fg-1)' }}>
          <Icon size={18} style={{ color, flex: 'none' }} />
          {title}
        </span>
        <span className="font-num font-black tabular-nums" style={{ fontSize: 22, color }}>
          {result.score}%
        </span>
      </div>
      <div className="overflow-hidden bg-gray-200" style={{ height: 12, borderRadius: 999 }}>
        <div
          className="h-full transition-all"
          style={{ width: `${result.score}%`, background: color, borderRadius: 999 }}
        />
      </div>

      {dev && (
        <div className="mt-2.5 flex gap-2">
          {(['teamA', 'teamB'] as const).map((k, i) => (
            <div key={k} className="flex flex-1 items-center gap-1.5 rounded-md bg-sunken px-2 py-1.5">
              <span className="text-[10px] font-bold text-fg-3">{i === 0 ? 'Time A' : 'Time B'}</span>
              <span className="ml-auto flex gap-1">
                {(['topo', 'meio', 'base'] as const).map((t) => (
                  <span
                    key={t}
                    className="rounded px-1 py-0.5 text-[9px] font-extrabold text-white"
                    style={{
                      background:
                        t === 'topo'
                          ? 'var(--color-green-600)'
                          : t === 'meio'
                            ? 'var(--color-gray-400)'
                            : 'var(--color-ink-600)',
                      opacity: result.tiers[k][t] ? 1 : 0.25,
                    }}
                  >
                    {result.tiers[k][t]}
                    {t[0].toUpperCase()}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 font-body text-xs text-fg-3">{hint}</p>

      {!result.levOk && (
        <p className="mt-1.5 flex items-center gap-1.5 font-body text-xs text-[#A85A00]">
          <TriangleAlert size={13} className="text-[#F08C00]" />
          {result.levTotal === 0
            ? 'Nenhum levantador presente — defina os times na mão.'
            : 'Um time ficou sem levantador. Ajuste se possível.'}
        </p>
      )}
    </div>
  )
}
