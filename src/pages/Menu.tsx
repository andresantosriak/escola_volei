import { Building2, UsersRound, User, SlidersHorizontal, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { ListRow } from '@/components/manage/ListRow'
import { useBranches } from '@/hooks/use-branches'
import { useClasses } from '@/hooks/use-classes'
import { useStudents } from '@/hooks/use-students'

export default function Menu() {
  const navigate = useNavigate()

  const { data: branches } = useBranches()
  const { data: classes } = useClasses()
  const { data: students } = useStudents()

  const branchCount = branches?.length ?? 0
  const classCount = classes?.length ?? 0
  const studentCount = students?.length ?? 0

  const items = [
    {
      to: '/manage/branches',
      icon: Building2,
      title: 'Filiais',
      subtitle: `${branchCount} unidade${branchCount !== 1 ? 's' : ''}`,
    },
    {
      to: '/manage/classes',
      icon: UsersRound,
      title: 'Turmas',
      subtitle: `${classCount} turma${classCount !== 1 ? 's' : ''} ativa${classCount !== 1 ? 's' : ''}`,
    },
    {
      to: '/students',
      icon: User,
      title: 'Alunos',
      subtitle: `${studentCount} na turma atual`,
    },
    {
      to: '/manage/skills',
      icon: SlidersHorizontal,
      title: 'Fundamentos',
      subtitle: 'Configurar avaliação',
    },
    {
      to: '/manage/settings',
      icon: SettingsIcon,
      title: 'Configurações',
      subtitle: 'Conta e preferências',
    },
  ]

  return (
    <>
      <ScreenHeader title="Menu" subtitle="Gerenciamento" brand />

      {/* List body — matches mockup er-body paddingTop 4 + er-list gap 9 */}
      <div className="flex flex-col gap-[9px] px-[18px] pt-1 pb-[calc(var(--bottom-nav-h)+24px)]">
        {items.map(({ to, icon, title, subtitle }) => (
          <ListRow
            key={to}
            title={title}
            subtitle={subtitle}
            leadingIcon={icon}
            onClick={() => navigate(to)}
          />
        ))}
      </div>
    </>
  )
}
