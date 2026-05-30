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

const TrainingContext = createContext<TrainingContextValue | undefined>(undefined)

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TrainingState>(empty)

  const startTraining = (teamId: string, teamName: string) =>
    setState({ ...empty, teamId, teamName })

  const setSession = (sessionId: string, present: TrainingPlayer[]) =>
    setState((s) => ({ ...s, sessionId, present }))

  const setResult = (result: BuildResult | null) => setState((s) => ({ ...s, result }))

  const reset = () => setState(empty)

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
