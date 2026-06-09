import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  KeyRound,
  LogOut,
  Languages,
  Moon,
  Ruler,
  Users,
  Armchair,
  Scale,
  FileDown,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ScreenHeader } from '@/components/layouts/ScreenHeader'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/tabs'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/students/Avatar'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { authService } from '@/services/auth-service'
import { useSettings, useSettingsMutations } from '@/hooks/use-settings'
import { exportStudentsCsv } from '@/lib/export-csv'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { data: settings } = useSettings()
  const { update } = useSettingsMutations()

  const [pwOpen, setPwOpen] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [exporting, setExporting] = useState(false)

  const fullName = (user?.user_metadata?.full_name as string) || '—'

  const onExport = async () => {
    setExporting(true)
    try {
      await exportStudentsCsv()
      toast.success('CSV exportado!')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setExporting(false)
    }
  }

  const changePassword = async () => {
    if (newPw.length < 6) {
      toast.error('A senha precisa ter ao menos 6 caracteres.')
      return
    }
    try {
      await authService.updatePassword(newPw)
      toast.success('Senha atualizada!')
      setPwOpen(false)
      setNewPw('')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const logout = async () => {
    try {
      await authService.signOut()
      navigate('/login', { replace: true })
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const chev = <ChevronRight size={18} className="shrink-0 text-fg-4" />

  return (
    <>
      <ScreenHeader title="Configurações" subtitle="Conta e preferências" back />

      <div className="px-[18px] pb-[calc(var(--bottom-nav-h)+24px)]" style={{ paddingTop: 4 }}>
        {/* ── CONTA ── */}
        <GroupLabel>Conta</GroupLabel>
        <div className="overflow-hidden rounded-[14px] shadow-sm">
          {/* User row */}
          <SRow
            leading={<Avatar name={fullName} size={44} />}
            title={fullName}
            subtitle={user?.email ?? '—'}
            right={chev}
          />
          <SRow icon={KeyRound} title="Trocar senha" right={chev} onClick={() => setPwOpen(true)} />
          <SRow
            icon={LogOut}
            title="Sair"
            iconColor="text-loss-500"
            titleColor="text-loss-500"
            right={null}
            onClick={logout}
          />
        </div>

        {/* ── PREFERENCIAS DO APP ── */}
        <GroupLabel>Preferências do app</GroupLabel>
        <div className="overflow-hidden rounded-[14px] shadow-sm">
          <SRow icon={Languages} title="Idioma" right={<SValue>Português (BR)</SValue>} />
          <SRow icon={Moon} title="Tema" right={
            <div className="w-[210px]">
              <Segmented
                options={[
                  { value: 'light', label: 'Claro' },
                  { value: 'dark', label: 'Escuro' },
                  { value: 'system', label: 'Sistema' },
                ]}
                value={theme}
                onChange={(v) => {
                  setTheme(v as 'light' | 'dark' | 'system')
                  update.mutate({ theme: v as 'light' | 'dark' | 'system' })
                }}
              />
            </div>
          } />
          <SRow icon={Ruler} title="Unidade de altura" right={
            <div className="w-[130px]">
              <Segmented
                options={[
                  { value: 'cm', label: 'cm' },
                  { value: 'ft', label: 'pol' },
                ]}
                value={settings?.height_unit ?? 'cm'}
                onChange={(v) => update.mutate({ height_unit: v as 'cm' | 'ft' })}
              />
            </div>
          } />
        </div>

        {/* ── PREFERENCIAS DE TREINO ── */}
        <GroupLabel>Preferências de treino</GroupLabel>
        <div className="overflow-hidden rounded-[14px] shadow-sm">
          <SRow icon={Users} title="Tamanho do time" right={
            <div className="w-[130px]">
              <Segmented
                options={[
                  { value: '6x6', label: '6x6' },
                  { value: '7x7', label: '7x7' },
                ]}
                value={settings?.team_size ?? '6x6'}
                onChange={(v) => update.mutate({ team_size: v })}
              />
            </div>
          } />
          <SRow icon={Armchair} title="Tratar sobra" right={<SValue>Banco / rodízio</SValue>} />
          <SRow icon={Scale} title="Modo de montagem" subtitle="Usado ao montar os times" right={null} />
          <div className="bg-surface px-[14px] pb-[13px]">
            <Segmented
              options={[
                { value: 'competitive', label: 'Competitivo' },
                { value: 'development', label: 'Desenvolvimento' },
              ]}
              value={settings?.assembly_mode ?? 'competitive'}
              onChange={(v) =>
                update.mutate({ assembly_mode: v as 'competitive' | 'development' })
              }
            />
          </div>
        </div>

        {/* ── DADOS ── */}
        <GroupLabel>Dados</GroupLabel>
        <div className="overflow-hidden rounded-[14px] shadow-sm">
          <SRow
            icon={FileDown}
            title={exporting ? 'Exportando…' : 'Exportar dados (CSV)'}
            right={chev}
            onClick={onExport}
          />
        </div>
      </div>

      {/* Password sheet */}
      <Sheet open={pwOpen} onClose={() => setPwOpen(false)} title="Alterar senha">
        <div className="mb-4">
          <p className="mb-1.5 font-body text-xs font-semibold text-fg-3">Nova senha</p>
          <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••" />
        </div>
        <Button full onClick={changePassword}>
          Salvar nova senha
        </Button>
      </Sheet>
    </>
  )
}

/* ────────────────── Local sub-components ────────────────── */

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-[22px] mb-[9px] px-1 font-body text-[11px] font-bold uppercase tracking-[0.05em] text-fg-3">
      {children}
    </div>
  )
}

/** Value text on the right side of a settings row */
function SValue({ children }: { children: ReactNode }) {
  return (
    <span className="font-body text-[13.5px] font-semibold text-fg-3">{children}</span>
  )
}

/** Settings row — grouped style (no individual card shadow, separated by border) */
interface SRowProps {
  icon?: LucideIcon
  leading?: ReactNode
  title: string
  subtitle?: string
  right?: ReactNode
  iconColor?: string
  titleColor?: string
  onClick?: () => void
}

function SRow({
  icon: Icon,
  leading,
  title,
  subtitle,
  right,
  iconColor,
  titleColor,
  onClick,
}: SRowProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="flex w-full items-center gap-[13px] border-t border-border-1 bg-surface px-[14px] py-[13px] text-left first:border-t-0"
    >
      {leading ?? (Icon ? (
        <span className={`shrink-0 ${iconColor ?? 'text-fg-2'}`}>
          <Icon size={20} />
        </span>
      ) : null)}
      <div className="min-w-0 flex-1">
        <div className={`font-body text-[15px] font-semibold ${titleColor ?? 'text-fg-1'}`}>
          {title}
        </div>
        {subtitle && (
          <div className="mt-px font-body text-[12px] text-fg-4">{subtitle}</div>
        )}
      </div>
      {right}
    </Tag>
  )
}
