// Página de DEV (sem auth) para comparar cada componente com seu preview HTML do design system.
// Cada bloco usa os MESMOS dados do preview correspondente em design-system/preview/.
// Acesse /__showcase. Não entra em produção (rota só montada em dev).
import { CalendarCheck, Flame, Trophy, Scale, AlertTriangle, Play, Shuffle } from 'lucide-react'
import { PlayerCard } from '@/components/students/PlayerCard'
import { ResultCard } from '@/components/history/ResultCard'
import { PresenceToggle } from '@/components/training/PresenceToggle'
import { StatBadge } from '@/components/students/StatBadge'
import { Scale5 } from '@/components/students/Scale5'
import { Stepper } from '@/components/training/Stepper'
import { Button } from '@/components/ui/button'
import type { MatchListItem } from '@/services/match-service'

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section data-shot={id} style={{ background: '#fff', padding: '22px 24px', marginBottom: 2 }}>
      <p className="font-display font-extrabold" style={{ fontSize: 14, marginBottom: 14 }}>{title}</p>
      {children}
    </section>
  )
}

// PlayerCard — dados do comp-playercard.html (Bruno 87, LEVANTADOR)
const bruno = {
  name: 'Bruno Almeida',
  position: 'LEV',
  overall: 87,
  age: 16,
  heightCm: 182,
  dominantHand: 'Destro',
  wins: 12,
  losses: 4,
  skills: { saque: 4, ataque: 5, recepcao: 4, levantamento: 5, bloqueio: 3, defesa: 4 },
}

// ResultCard — dados do comp-resultado.html (Furacão 2×1 Tubarões)
const match: MatchListItem = {
  id: 'm', team_id: 't', coach_id: 'c', session_id: null,
  match_date: '2026-05-27', team_a_name: 'Furacão', team_b_name: 'Tubarões',
  winner: 'a', walkover: false, balance_score: 93, format: 'best_of_3',
  created_at: '', updated_at: '',
  set_summary: '25–22 · 23–25 · 15–11', sets_a: 2, sets_b: 1,
  roster_a: ['Bruno', 'Lucas', 'Marina', 'A', 'B', 'C', 'D'],
  roster_b: ['Pedro', 'Joana', 'Rafa', 'A', 'B', 'C', 'D'],
}

export default function Showcase() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#F4F6FB' }}>
      <Block id="playercard" title="PlayerCard">
        <div style={{ width: 300 }}>
          <PlayerCard player={bruno} />
        </div>
      </Block>

      <Block id="resultado" title="Card de resultado de partida">
        <ResultCard match={match} />
      </Block>

      <Block id="presenca" title="Toggle de presença">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PresenceToggle value="present" onChange={() => {}} />
          <PresenceToggle value="absent" onChange={() => {}} />
          <PresenceToggle value="late" onChange={() => {}} />
        </div>
      </Block>

      <Block id="statbadge" title="Badge de stat">
        {/* 5 badges idênticos a comp-statbadge.html: trophy, loss, neutral, calendar-check, flame */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatBadge value="12V" tone="win" icon={Trophy} />
          <StatBadge value="4D" tone="loss" />
          <StatBadge value="75%" tone="neutral" label="aproveitamento" />
          <StatBadge value="85%" tone="win" icon={CalendarCheck} label="presença" />
          <StatBadge value="3" tone="neutral" icon={Flame} label="vitórias seguidas" />
        </div>
      </Block>

      <Block id="avaliacao" title="Controle de avaliação (Stepper + Scale 1-5)">
        <div style={{ marginBottom: 18 }}>
          <Stepper value={4} onChange={() => {}} />
        </div>
        <Scale5 value={4} onChange={() => {}} />
      </Block>

      <Block id="equilibrio" title="Indicador de equilíbrio">
        <div className="bg-gray-50" style={{ borderRadius: 16, padding: '16px 18px', marginBottom: 12 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span className="flex items-center gap-2 font-body font-bold" style={{ fontSize: 14 }}>
              <Scale size={18} style={{ color: 'var(--color-bal-500)' }} />Times equilibrados
            </span>
            <span className="font-num font-black tabular-nums" style={{ fontSize: 22, color: 'var(--color-bal-700)' }}>94%</span>
          </div>
          <div className="overflow-hidden bg-gray-200" style={{ height: 12, borderRadius: 999 }}>
            <div style={{ width: '94%', height: '100%', background: 'var(--color-bal-500)', borderRadius: 999 }} />
          </div>
          <p className="text-fg-3" style={{ fontSize: 11, marginTop: 8 }}>Cada fundamento dividido de forma parelha · ambos os times têm levantador.</p>
        </div>
        <div className="bg-gray-50" style={{ borderRadius: 16, padding: '16px 18px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span className="flex items-center gap-2 font-body font-bold" style={{ fontSize: 14 }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warn-500)' }} />Pode melhorar
            </span>
            <span className="font-num font-black tabular-nums" style={{ fontSize: 22, color: 'var(--color-warn-700)' }}>68%</span>
          </div>
          <div className="overflow-hidden bg-gray-200" style={{ height: 12, borderRadius: 999 }}>
            <div style={{ width: '68%', height: '100%', background: 'var(--color-warn-500)', borderRadius: 999 }} />
          </div>
          <p className="text-fg-3" style={{ fontSize: 11, marginTop: 8 }}>Time Azul concentra os melhores ataques. Toque em "Reequilibrar".</p>
        </div>
      </Block>

      {/* fiel a comp-buttons.html: primary c/ play, primary "Pressed", ghost(secondary) c/ shuffle,
          outline(ghost) "Cancelar" sem ícone, e full primary c/ play */}
      <Block id="buttons" title="Buttons">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <Button><Play /> Iniciar treino</Button>
          <Button><Play /> Pressed</Button>
          <Button variant="secondary"><Shuffle /> Reequilibrar</Button>
          <Button variant="ghost">Cancelar</Button>
        </div>
        <Button size="lg" full><Play /> Iniciar treino</Button>
      </Block>
    </div>
  )
}
