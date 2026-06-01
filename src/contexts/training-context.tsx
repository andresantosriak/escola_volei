import { createContext, useContext, useState, type ReactNode } from 'react'
import type { EnginePlayer } from '@/engine'
import type { BuildResult } from '@/engine'

export interface TrainingPlayer extends EnginePlayer {
  photoUrl?: string | null
}

interface TrainingState {
  teamId: string | null
  teamName: string | null
  sessionId: string | null
  present: TrainingPlayer[]
  result: BuildResult | null
}

interface TrainingContextValue extends TrainingState {
  startTraining: (teamId: string, teamName: string) => void
  setSession: (sessionId: string, present: TrainingPlayer[]) => void
  setResult: (result: BuildResult | null) => void
  reset: () => void
}

const empty: TrainingState = {
  teamId: null,
  teamName: null,
  sessionId: null,
  present: [],
  result: null,
}

// Persiste o treino em sessionStorage para sobreviver a F5/reload da aba.
// (sessionStorage some ao fechar a aba — escopo certo p/ uma sessão de treino.)
const KEY = 'er.training'

function load(): TrainingState {
  if (typeof window === 'undefined') return empty
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return empty
    return { ...empty, ...(JSON.parse(raw) as Partial<TrainingState>) }
  } catch {
    return empty
  }
}

function save(state: TrainingState) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* quota/serialização — ignora, app segue só com estado em memória */
  }
}

const TrainingContext = createContext<TrainingContextValue | undefined>(undefined)

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<TrainingState>(load)

  const setState = (next: TrainingState | ((s: TrainingState) => TrainingState)) =>
    setStateRaw((prev) => {
      const value = typeof next === 'function' ? (next as (s: TrainingState) => TrainingState)(prev) : next
      save(value)
      return value
    })

  const startTraining = (teamId: string, teamName: string) =>
    setState({ ...empty, teamId, teamName })

  const setSession = (sessionId: string, present: TrainingPlayer[]) =>
    setState((s) => ({ ...s, sessionId, present }))

  const setResult = (result: BuildResult | null) => setState((s) => ({ ...s, result }))

  const reset = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(KEY)
      } catch {
        /* ignore */
      }
    }
    setStateRaw(empty)
  }

  return (
    <TrainingContext.Provider value={{ ...state, startTraining, setSession, setResult, reset }}>
      {children}
    </TrainingContext.Provider>
  )
}

export function useTraining() {
  const ctx = useContext(TrainingContext)
  if (!ctx) throw new Error('useTraining deve ser usado dentro de TrainingProvider')
  return ctx
}
