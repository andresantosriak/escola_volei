import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './router'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </Providers>
    </ErrorBoundary>
  )
}
