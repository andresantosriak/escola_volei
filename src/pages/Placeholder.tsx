import { Construction } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { EmptyState } from '@/components/layouts/EmptyState'

export function Placeholder({ title, sprint }: { title: string; sprint: string }) {
  return (
    <>
      <Header title={title} back />
      <div className="p-4">
        <EmptyState
          icon={Construction}
          title="Em construção"
          description={`Esta tela será concluída na ${sprint}.`}
        />
      </div>
    </>
  )
}
