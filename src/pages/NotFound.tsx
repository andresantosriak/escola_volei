import { useNavigate } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col items-center justify-center gap-4 bg-app px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-sunken text-fg-3">
        <SearchX size={30} />
      </div>
      <h1 className="q-h2">Página não encontrada</h1>
      <p className="font-body text-sm text-fg-3">A tela que você procura não existe.</p>
      <Button onClick={() => navigate('/')}>Voltar ao início</Button>
    </div>
  )
}
