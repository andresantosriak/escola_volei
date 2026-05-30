# CLAUDE.md — Esporte Recreacao

> Apenas o que e especifico deste projeto.
> Padroes globais em ~/.claude/CLAUDE.md — nao repetir aqui.

## Stack

- Vite + React 18 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- Supabase (Auth + Database + Storage) — project_id: `alqagnftooeuzscomyku`
- TanStack React Query v5, React Router DOM v6, React Hook Form + Zod
- Fonts: Archivo (display/stats) + Barlow (body/UI) — Google Fonts CDN
- Icons: lucide-react

## Comandos

```bash
npm run dev      # Dev server (Vite)
npm run build    # Build producao
npm run lint     # ESLint
npm run preview  # Preview do build
```

## Estrutura de Pastas

```
src/
├── app/          # App shell (router, providers)
├── pages/        # Rotas (Home, training/*, students/*, history/*, manage/*)
├── components/
│   ├── ui/       # shadcn/ui (atoms)
│   ├── training/ # PresenceToggle, TeamPanel, BalanceIndicator, Stepper, BuildOptions
│   ├── students/ # Avatar, PlayerCard, StatBadge, PositionField, Scale5
│   ├── history/  # ResultCard, SetScoreRow
│   ├── manage/   # InfoRow, ListRow
│   ├── share/    # SharePreview
│   ├── auth/     # ProtectedRoute, AuthForm
│   └── layouts/  # AppLayout, Header, BottomNav, EmptyState
├── hooks/        # use-auth, use-students, use-classes, use-team-builder, etc.
├── contexts/     # AuthContext, ThemeContext
├── engine/       # Balance engine — pure TS, zero deps (build-teams, balance-score, tier-map)
├── services/     # Acesso ao Supabase (um service por dominio)
├── schemas/      # Zod schemas (um schema por dominio)
├── integrations/supabase/  # Client + types gerados
├── lib/          # utils.ts, constants.ts, format.ts
├── types/        # TypeScript types
└── styles/       # globals.css (tokens), fonts.css
```

## Convencoes de Codigo

- Arquivos em kebab-case, componentes em PascalCase
- Um componente por arquivo
- Engine em `src/engine/` — pure functions, sem React, sem Supabase
- Services em `src/services/` — unico ponto de acesso ao Supabase (nunca `supabase.from()` em componentes)
- Schemas Zod em `src/schemas/` — tipos inferidos com `z.infer<typeof schema>`
- Query keys hierarquicas: `['students']`, `['students', id]`, `['classes', { branchId }]`

## Supabase

### Config

- Project ID: `alqagnftooeuzscomyku` (remoto)
- Client: `src/integrations/supabase/client.ts`
- Types: `src/integrations/supabase/types.ts`
- Regenerar tipos: `npx supabase gen types typescript --project-id alqagnftooeuzscomyku > src/integrations/supabase/types.ts`

### RLS — Padrao deste projeto

Multi-tenant por treinador. Toda tabela com dados do coach tem `coach_id UUID NOT NULL DEFAULT auth.uid()`.

```sql
-- Padrao de policy (aplicar em toda tabela)
CREATE POLICY "coach isolation: select" ON tabela
  FOR SELECT USING (coach_id = (SELECT auth.uid()));

CREATE POLICY "coach isolation: insert" ON tabela
  FOR INSERT WITH CHECK (coach_id = (SELECT auth.uid()));

CREATE POLICY "coach isolation: update" ON tabela
  FOR UPDATE USING (coach_id = (SELECT auth.uid()))
  WITH CHECK (coach_id = (SELECT auth.uid()));

CREATE POLICY "coach isolation: delete" ON tabela
  FOR DELETE USING (coach_id = (SELECT auth.uid()));
```

Regras:
- Wrapper `(SELECT auth.uid())` — SEMPRE (evita re-execucao por linha)
- `coach_id` NUNCA vem do client — `DEFAULT auth.uid()` no INSERT
- Indice em `coach_id` em toda tabela
- SECURITY DEFINER com `SET search_path = public` em funcoes
- Nunca policies SELECT aditivas no mesmo role (anti-pattern: vazamento via OR)

### Migrations

```bash
npx supabase migration new <nome>   # Criar migracao
npx supabase db push                # Aplicar no remoto
```

Migrations atomicas: tabela + RLS + indices na mesma migracao.

### Storage

- Bucket `student-photos` — privado
- Path: `{coach_id}/{student_id}.{ext}`
- Policies de storage vinculadas ao `coach_id`

## Auth

- Supabase Auth com email/password
- `AuthContext` gerencia sessao via `onAuthStateChange`
- `ProtectedRoute` redireciona `/login` se nao autenticado
- Verificacao de sessao: `getUser()` (NUNCA `getSession()`)
- Env vars no client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `service_role_key` apenas em Edge Functions (se houver)

## Componentes

### shadcn/ui (atoms em `components/ui/`)

Button, Input, Sheet, Tabs, Badge, Toggle, Slider, Select, Dialog, Toast (sonner)

### Custom (dominio — por feature)

- **PlayerCard** — card gamificado FUT (overall, fundamentos, V/D)
- **PresenceToggle** — tristate: presente/falta/atraso
- **BalanceIndicator** — indicador circular de equilibrio (%)
- **TeamPanel** — roster de um time
- **Avatar** — iniciais com cor deterministica ou foto
- **Stepper** — +/- para sets
- **StatBadge** — badge numerico com label
- **Scale5** — barra de rating 1-5
- **ResultCard** — card de resultado com sets
- **BottomNav** — 4 tabs (Inicio, Historico, Alunos, Menu)

## Design Tokens

Referencia: `design-system/colors_and_type.css`

- Primary: Verde Canarinho `#009C3B` (seleção brasileira)
- Accent: Amarelo Ouro `#FFCB00`
- Premium/dark: Azul Bandeira `#002776`
- Dark theme: class strategy com `[data-theme="dark"]` + CSS variables remapeadas
- Touch target minimo: 48px
- Canvas mobile: 390x844

## Documentacao do Projeto

- `docs/escola-volei-prd.md` — produto, personas, MVP
- `docs/escola-volei-stories.md` — user stories
- `docs/escola-volei-security-review.md` — requisitos de seguranca
- `docs/escola-volei-design-system.md` — design system adaptado para Tailwind+shadcn
- `docs/escola-volei-architecture.md` — estrutura, decisoes tecnicas
- `docs/adr/` — ADRs (decisoes arquiteturais)
- `design-system/` — design system original (tokens, UI kit, assets)
