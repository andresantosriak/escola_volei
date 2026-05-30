import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col items-center justify-center gap-4 bg-app px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#FFF0DD] text-[#A85A00]">
            <AlertTriangle size={30} />
          </div>
          <h1 className="q-h2">Algo deu errado</h1>
          <p className="font-body text-sm text-fg-3">
            Tente recarregar a página. Se o problema continuar, feche e abra o app novamente.
          </p>
          <Button onClick={() => window.location.assign('/')}>Recarregar</Button>
        </div>
      )
    }
    return this.props.children
  }
}
