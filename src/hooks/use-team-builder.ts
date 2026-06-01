import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { buildTeams, balanceScore, type BuildOptions, type BuildResult } from '@/engine'
import type { TrainingPlayer } from '@/contexts/training-context'

export function useTeamBuilder(present: TrainingPlayer[]) {
  const [result, setResult] = useState<BuildResult | null>(null)
  // seed por instância (useRef evita estado global mutável e problemas em StrictMode)
  const seedRef = useRef(1)

  const build = useCallback(
    (opts: Omit<BuildOptions, 'seed'>) => {
      // seed sempre novo a cada montagem → reequilíbrio gera divisão (e banco) diferentes
      seedRef.current = (seedRef.current + 1) % 100000
      const r = buildTeams(present, { ...opts, seed: seedRef.current })
      setResult(r)
      return r
    },
    [present],
  )

  /** Move um jogador do time A↔B e recalcula o índice live (swap manual). Nunca esvazia um time. */
  const swapPlayer = useCallback((playerId: string) => {
    setResult((prev) => {
      if (!prev) return prev
      const inA = prev.teamA.some((p) => p.id === playerId)
      const inB = prev.teamB.some((p) => p.id === playerId)
      if (!inA && !inB) return prev
      if ((inA && prev.teamA.length === 1) || (inB && prev.teamB.length === 1)) {
        toast.warning('Cada time precisa de pelo menos 1 jogador.')
        return prev
      }
      const player = (inA ? prev.teamA : prev.teamB).find((p) => p.id === playerId)!
      const teamA = inA ? prev.teamA.filter((p) => p.id !== playerId) : [...prev.teamA, player]
      const teamB = inB ? prev.teamB.filter((p) => p.id !== playerId) : [...prev.teamB, player]
      return { ...prev, teamA, teamB, score: balanceScore(teamA, teamB) }
    })
  }, [])

  return { result, build, swapPlayer, setResult }
}
