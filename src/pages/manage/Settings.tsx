import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, LogOut, KeyRound, Sun, Moon, Monitor } from 'lucide-react'
import { Header } from '@/components/layouts/Header'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/tabs'
import { Select } from '@/components/ui/select'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { InfoRow } from '@/components/manage/InfoRow'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { authService } from '@/services/auth-service'
import { useSettings, useSettingsMutations } from '@/hooks/use-settings'
import { exportStudentsCsv } from '@/lib/export-csv'
import { TEAM_SIZES } from '@/lib/constants'

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

  return (
    <>
      <Header title="Configurações" back />
      <div className="space-y-6 p-4">
        <section>
          <h3 className="mb-2 px-0.5 font-body text-sm font-bold text-fg-2">Conta</h3>
          <div className="rounded-lg border border-border-1 bg-surface px-4 py-1">
            <InfoRow label="Nome" value={fullName} />
            <InfoRow label="E-mail" value={user?.email} />
          </div>
          <Button variant="secondary" full className="mt-2" onClick={() => setPwOpen(true)}>
            <KeyRound size={18} /> Alterar senha
          </Button>
        </section>

        <section>
          <h3 className="mb-2 px-0.5 font-body text-sm font-bold text-fg-2">Aparência</h3>
          <Segmented
            value={theme}
            onChange={(v) => {
              setTheme(v as 'light' | 'dark' | 'system')
              update.mutate({ theme: v as 'light' | 'dark' | 'system' })
            }}
            options={[
              { value: 'light', label: '☀ Claro' },
              { value: 'dark', label: '🌙 Escuro' },
              { value: 'system', label: '⚙ Sistema' },
            ]}
          />
          <div className="mt-2 flex items-center gap-2 px-1 text-xs text-fg-4">
            {theme === 'light' ? <Sun size={13} /> : theme === 'dark' ? <Moon size={13} /> : <Monitor size={13} />}
            O tema é salvo neste dispositivo e na sua conta.
          </div>
        </section>

        <section>
          <h3 className="mb-2 px-0.5 font-body text-sm font-bold text-fg-2">Preferências de treino</h3>
          <div className="flex flex-col gap-3">
            <Pref label="Unidade de altura">
              <Select
                className="w-32"
                value={settings?.height_unit ?? 'cm'}
                onChange={(e) => update.mutate({ height_unit: e.target.value as 'cm' | 'ft' })}
                options={[
                  { value: 'cm', label: 'cm' },
                  { value: 'ft', label: 'pés' },
                ]}
              />
            </Pref>
            <Pref label="Tamanho padrão">
              <Select
                className="w-32"
                value={settings?.team_size ?? '6x6'}
                onChange={(e) => update.mutate({ team_size: e.target.value })}
                options={TEAM_SIZES.map((s) => ({ value: s, label: s }))}
              />
            </Pref>
            <Pref label="Modo de montagem">
              <Select
                className="w-44"
                value={settings?.assembly_mode ?? 'competitive'}
                onChange={(e) =>
                  update.mutate({ assembly_mode: e.target.value as 'competitive' | 'development' })
                }
                options={[
                  { value: 'competitive', label: 'Competitivo' },
                  { value: 'development', label: 'Desenvolvimento' },
                ]}
              />
            </Pref>
            <Pref label="Tratar sobra">
              <Select
                className="w-40"
                value={settings?.bench_policy ?? 'bench'}
                onChange={(e) => update.mutate({ bench_policy: e.target.value as 'bench' | 'rotation' })}
                options={[
                  { value: 'bench', label: 'Banco' },
                  { value: 'rotation', label: 'Rodízio' },
                ]}
              />
            </Pref>
          </div>
        </section>

        <section>
          <h3 className="mb-2 px-0.5 font-body text-sm font-bold text-fg-2">Dados</h3>
          <Button variant="secondary" full onClick={onExport} disabled={exporting}>
            <Download size={18} /> {exporting ? 'Exportando…' : 'Exportar alunos (CSV)'}
          </Button>
        </section>

        <Button variant="ghost" full className="text-loss" onClick={logout}>
          <LogOut size={18} /> Sair da conta
        </Button>
      </div>

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

function Pref({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-1 bg-surface px-3.5 py-2.5">
      <span className="font-body text-sm">{label}</span>
      {children}
    </div>
  )
}
