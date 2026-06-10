import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './router'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        {/* v7_startTransition desligado: ele envolvia a navegação em startTransition
            (render concorrente), fazendo a rota de destino ler o estado do contexto
            (present/result) ANTES do update propagar — race que esvaziava os times e
            a avaliação. Sem ele, navegação é síncrona e o flushSync commita antes. */}
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  )
}
