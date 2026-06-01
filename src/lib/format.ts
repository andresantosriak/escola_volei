import { AVATAR_COLORS } from './constants'

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function avatarColor(name: string): [string, string] {
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length]
}

// Overall 48-98 a partir da média dos fundamentos (escala 1-5)
export function overallFromSkills(values: number[]): number {
  if (values.length === 0) return 73 // média neutra (todos 3)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.round(48 + ((avg - 1) / 4) * 50)
}

export function formatHeight(cm: number | null | undefined): string {
  if (!cm) return '—'
  return (cm / 100).toFixed(2).replace('.', ',') + ' m'
}

export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function formatDateFull(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

// Fiel a design-system/preview/comp-resultado.html (.date): "Ter · 27 mai" — weekday · dia mês,
// sem ano, sem pontos, separador middot. (a ResultCard aplica uppercase via CSS, igual ao preview.)
export function formatMatchCardDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace(/\.$/, '')
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace(/\.$/, '')
  return `${weekday} · ${d.getDate()} ${month}`
}

export function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}
