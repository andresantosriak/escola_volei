# Arquitetura: Esporte Recreacao

## Stack

- **Framework:** Vite + React 18 + TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Radix primitives + CVA variants)
- **Backend:** Supabase (Auth + Database/Postgres + Storage + Edge Functions se necessario)
- **Data Fetching:** TanStack React Query v5 + Supabase client
- **Routing:** React Router DOM v6
- **Forms:** React Hook Form + Zod
- **Icons:** lucide-react
- **Charts:** Recharts (futuro — opcional v1)
- **Share:** html-to-image (geracao de imagem client-side para compartilhamento)

## Estrutura de Pastas

```
src/
├── app/                        # App shell
│   ├── App.tsx                 # Router + providers + layout
│   ├── router.tsx              # Definicao de rotas (createBrowserRouter)
│   └── providers.tsx           # QueryClientProvider + AuthProvider + ThemeProvider
│
├── pages/                      # Rotas (uma page por rota)
│   ├── Home.tsx                # Selecao de turma + iniciar treino
│   ├── Login.tsx               # Login (email/password)
│   ├── Register.tsx            # Cadastro do treinador
│   ├── ForgotPassword.tsx      # Recuperacao de senha
│   ├── ResetPassword.tsx       # Redefinir senha (via link)
│   │
│   ├── training/               # Fluxo de treino (core)
│   │   ├── Attendance.tsx      # Chamada (presenca)
│   │   ├── BuildTeams.tsx      # Montar times (balance engine)
│   │   ├── RegisterResult.tsx  # Registrar resultado da partida
│   │   └── EvaluatePlayer.tsx  # Avaliacao rapida pos-treino
│   │
│   ├── students/               # Alunos
│   │   ├── StudentList.tsx     # Lista de alunos da turma
│   │   └── StudentDetail.tsx   # Perfil do aluno (dados + desempenho/card)
│   │
│   ├── history/                # Historico
│   │   ├── MatchHistory.tsx    # Lista de partidas
│   │   └── MatchDetail.tsx     # Detalhe da partida (sets, rosters, share)
│   │
│   ├── manage/                 # Gerenciamento
│   │   ├── Branches.tsx        # Lista de filiais
│   │   ├── BranchDetail.tsx    # Detalhe/edicao/criacao de filial
│   │   ├── Classes.tsx         # Lista de turmas
│   │   ├── ClassDetail.tsx     # Detalhe/edicao/criacao de turma
│   │   ├── Skills.tsx          # Configurar fundamentos (escala, pesos, ativos)
│   │   └── Settings.tsx        # Configuracoes (conta, tema, preferencias)
│   │
│   └── share/                  # Compartilhamento
│       └── ShareCard.tsx       # Gerador de imagem (player card, resultado)
│
├── components/
│   ├── ui/                     # shadcn/ui (atoms) — gerado via CLI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── toggle.tsx
│   │   ├── slider.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx           # sonner
│   │   └── ...
│   │
│   ├── auth/                   # Componentes de autenticacao
│   │   ├── ProtectedRoute.tsx  # Guard de rota autenticada
│   │   └── AuthForm.tsx        # Form compartilhado login/register
│   │
│   ├── training/               # Componentes do fluxo de treino
│   │   ├── PresenceToggle.tsx  # Toggle presente/falta/atraso
│   │   ├── TeamPanel.tsx       # Painel de um time (roster + forca)
│   │   ├── BalanceIndicator.tsx# Indicador de equilibrio (%)
│   │   ├── Stepper.tsx         # +/- para sets
│   │   └── BuildOptions.tsx    # Modo/tamanho/sobra
│   │
│   ├── students/               # Componentes de alunos
│   │   ├── Avatar.tsx          # Avatar com iniciais ou foto
│   │   ├── PlayerCard.tsx      # Card gamificado estilo FUT
│   │   ├── StatBadge.tsx       # Badge de estatistica
│   │   ├── PositionField.tsx   # Seletor de posicao (principal + alternativas)
│   │   └── Scale5.tsx          # Escala visual de 1-5
│   │
│   ├── history/                # Componentes de historico
│   │   ├── ResultCard.tsx      # Card de resultado na lista
│   │   └── SetScoreRow.tsx     # Linha de score por set
│   │
│   ├── manage/                 # Componentes de gerenciamento
│   │   ├── InfoRow.tsx         # Linha de info (label + valor) read view
│   │   └── ListRow.tsx         # Linha de lista com chevron
│   │
│   ├── share/                  # Componentes de compartilhamento
│   │   └── SharePreview.tsx    # Preview da imagem gerada
│   │
│   └── layouts/                # Layouts compartilhados
│       ├── AppLayout.tsx       # Layout principal (header + bottom nav + content)
│       ├── Header.tsx          # Header com titulo + back button
│       ├── BottomNav.tsx       # Navegacao inferior (Inicio, Historico, Alunos, Menu)
│       ├── StatusBar.tsx       # Barra de status (hora, bateria — cosmetic)
│       └── EmptyState.tsx      # Estado vazio reutilizavel
│
├── hooks/                      # Custom hooks
│   ├── use-auth.ts             # Auth state + session management
│   ├── use-branches.ts         # CRUD de filiais (TanStack Query)
│   ├── use-classes.ts          # CRUD de turmas (TanStack Query)
│   ├── use-students.ts         # CRUD de alunos (TanStack Query)
│   ├── use-matches.ts          # CRUD de partidas (TanStack Query)
│   ├── use-evaluations.ts      # CRUD de avaliacoes (TanStack Query)
│   ├── use-skills-config.ts    # Config de fundamentos (TanStack Query)
│   ├── use-team-builder.ts     # Wrapper do engine de balance
│   ├── use-theme.ts            # Dark/light/system theme toggle
│   └── use-share-image.ts      # Geracao de imagem para compartilhamento
│
├── contexts/                   # React Context (estado global)
│   ├── auth-context.tsx        # AuthContext (session, user, sign in/out)
│   └── theme-context.tsx       # ThemeContext (dark/light/system)
│
├── engine/                     # Engine de balanceamento de times
│   ├── build-teams.ts          # Algoritmo principal (pure function)
│   ├── balance-score.ts        # Calculo de indice de equilibrio
│   ├── tier-map.ts             # Classificacao topo/meio/base
│   └── types.ts                # Tipos do engine
│
├── services/                   # Logica de negocio + acesso a dados
│   ├── auth-service.ts         # Sign in, sign up, sign out, reset password
│   ├── branch-service.ts       # CRUD filiais no Supabase
│   ├── class-service.ts        # CRUD turmas no Supabase
│   ├── student-service.ts      # CRUD alunos no Supabase
│   ├── match-service.ts        # CRUD partidas + sets no Supabase
│   ├── evaluation-service.ts   # CRUD avaliacoes no Supabase
│   ├── skills-config-service.ts# Config de fundamentos no Supabase
│   └── storage-service.ts      # Upload/download de fotos (Supabase Storage)
│
├── schemas/                    # Schemas Zod (validacao de forms + API)
│   ├── auth-schema.ts          # Login, register, reset password
│   ├── branch-schema.ts        # Filial create/update
│   ├── class-schema.ts         # Turma create/update
│   ├── student-schema.ts       # Aluno create/update
│   ├── match-schema.ts         # Partida + sets
│   ├── evaluation-schema.ts    # Avaliacao (engajamento + ajustes)
│   └── skills-config-schema.ts # Config de fundamentos
│
├── integrations/               # Supabase client + configs externas
│   └── supabase/
│       ├── client.ts           # createClient com env vars
│       └── types.ts            # Tipos gerados do banco (supabase gen types)
│
├── lib/                        # Utilitarios puros
│   ├── utils.ts                # cn() + helpers gerais
│   ├── constants.ts            # Constantes do app (posicoes, fundamentos default)
│   └── format.ts               # Formatadores (data, percentual, iniciais)
│
├── types/                      # TypeScript types/interfaces
│   ├── database.ts             # Tipos derivados do banco (re-exports de supabase/types.ts)
│   ├── training.ts             # Tipos do fluxo de treino (presenca, resultado, avaliacao)
│   ├── engine.ts               # Tipos do engine de balance (re-exports de engine/types.ts)
│   └── ui.ts                   # Tipos de UI (tab, nav, theme)
│
└── styles/                     # Estilos globais
    ├── globals.css             # @tailwind directives + CSS variables do design system
    └── fonts.css               # Import Google Fonts (Archivo + Barlow)
```

## Padrao de Rotas

React Router DOM v6 com `createBrowserRouter`.

| URL | Page Component | Auth | Descricao |
|-----|---------------|------|-----------|
| `/login` | `Login.tsx` | Publica | Login do treinador |
| `/register` | `Register.tsx` | Publica | Cadastro do treinador |
| `/forgot-password` | `ForgotPassword.tsx` | Publica | Recuperacao de senha |
| `/reset-password` | `ResetPassword.tsx` | Publica | Redefinir senha (link magico) |
| `/` | `Home.tsx` | Protegida | Selecao de turma + iniciar treino |
| `/training/attendance` | `Attendance.tsx` | Protegida | Chamada (presenca) |
| `/training/teams` | `BuildTeams.tsx` | Protegida | Montar times |
| `/training/result` | `RegisterResult.tsx` | Protegida | Registrar resultado |
| `/training/evaluate/:studentId` | `EvaluatePlayer.tsx` | Protegida | Avaliacao rapida |
| `/students` | `StudentList.tsx` | Protegida | Lista de alunos |
| `/students/:id` | `StudentDetail.tsx` | Protegida | Perfil do aluno |
| `/history` | `MatchHistory.tsx` | Protegida | Historico de partidas |
| `/history/:id` | `MatchDetail.tsx` | Protegida | Detalhe da partida |
| `/manage/branches` | `Branches.tsx` | Protegida | Lista de filiais |
| `/manage/branches/new` | `BranchDetail.tsx` | Protegida | Nova filial |
| `/manage/branches/:id` | `BranchDetail.tsx` | Protegida | Detalhe/edicao filial |
| `/manage/classes` | `Classes.tsx` | Protegida | Lista de turmas |
| `/manage/classes/new` | `ClassDetail.tsx` | Protegida | Nova turma |
| `/manage/classes/:id` | `ClassDetail.tsx` | Protegida | Detalhe/edicao turma |
| `/manage/skills` | `Skills.tsx` | Protegida | Config fundamentos |
| `/manage/settings` | `Settings.tsx` | Protegida | Configuracoes |
| `/share` | `ShareCard.tsx` | Protegida | Gerador de imagem |

### Layout e navegacao

- **AppLayout** envolve todas as rotas protegidas: Header (top) + BottomNav (bottom) + content (scrollavel)
- **BottomNav** tem 4 tabs: Inicio (`/`), Historico (`/history`), Alunos (`/students`), Menu (abre gerenciamento)
- Fluxo de treino (`/training/*`) esconde a BottomNav e usa Header com back button
- Gerenciamento (`/manage/*`) usa back-stack navegacional
- Sheets/overlays (resultado, share, avaliacao) renderizam como modais sobre a tela atual

## Decisoes de Arquitetura

Detalhes completos nos ADRs em `docs/adr/`.

- **Vite + React 18 + TypeScript** como framework — SPA mobile-first sem SSR necessario (ADR-001)
- **Engine de balanceamento client-side** como pure TypeScript function — roda 600 iteracoes no browser, testavel sem backend (ADR-002)
- **Multi-tenancy via RLS com `auth.uid()`** — cada treinador ve apenas seus dados, isolamento no banco (ADR-003)
- **TanStack Query para server state** — cache, loading states, refetch automatico; `useState`/Context apenas para UI state (tema, navegacao de treino)
- **React Router DOM v6 com `createBrowserRouter`** — roteamento declarativo, layouts aninhados, loaders quando necessario
- **Dark theme com class strategy** — `[data-theme="dark"]` no root, CSS variables remapeadas; Tailwind `dark:` classes; ThemeContext gerencia preferencia (Claro/Escuro/Sistema)
- **Componentes do design system: shadcn/ui base + custom** — atoms (Button, Input, Sheet, etc.) vem do shadcn; componentes de dominio (PlayerCard, PresenceToggle, BalanceIndicator, etc.) sao custom, vivem em `components/{feature}/`
- **Supabase Storage com bucket privado** para fotos de alunos — acesso controlado por RLS
- **Compartilhamento via html-to-image** — gera imagem no client, sem backend; usuario compartilha via share API nativa ou download

## Regras Tecnicas do Projeto

### Componentes

- Um componente por arquivo, nomeado em PascalCase
- Arquivos em kebab-case: `player-card.tsx` exporta `PlayerCard`
- Componentes `ui/` sao shadcn/ui puro — modificar livremente, nunca importar de `node_modules`
- Componentes de dominio em `components/{feature}/` — nunca em `ui/`
- Props tipadas com `interface {Feature}Props` no topo do arquivo

### State Management

- **Server state** (dados do Supabase): TanStack React Query exclusivamente
  - Query keys hierarquicas: `['branches']`, `['branches', id]`, `['classes', { branchId }]`
  - `invalidateQueries` apos mutations
  - Hooks em `hooks/use-{feature}.ts` encapsulam queries e mutations
- **UI state** (tema, tab ativa, flow de treino): `useState` local ou React Context
  - Contextos em `contexts/` — apenas `AuthContext` e `ThemeContext`
  - Sem Redux, sem Zustand — app simples demais para state management externo
- **Engine state** (resultado do balanceamento): calculado sob demanda, guardado em `useState` local da page `BuildTeams`

### Services

- `services/{feature}-service.ts` encapsula todo acesso ao Supabase
- Nunca chamar `supabase.from()` direto de componentes ou hooks — sempre via service
- Services retornam dados tipados, nunca `any`
- Tratamento de erro dentro do service: throw com mensagem descritiva

### Validacao

- Toda boundary validada com Zod: forms (React Hook Form + zodResolver), inputs de service
- Tipos inferidos de schemas Zod: `z.infer<typeof schema>` — nunca duplicar
- Schemas em `schemas/{feature}-schema.ts`

### Engine de Balanceamento

- **Pure functions** em `engine/` — sem side effects, sem dependencia de React ou Supabase
- Recebe array de jogadores presentes + opcoes (modo, tamanho) → retorna resultado
- 600 iteracoes randomizadas + local-swap — roda client-side em <100ms
- Dois modos: **Competitivo** (maximizar equilibrio) e **Desenvolvimento** (forcar mistura de niveis)
- Constraint de levantador: >=1 por time (principal ou alternativa)
- Testavel unitariamente sem browser

### Auth

- Supabase Auth com email/password
- `AuthContext` gerencia sessao: `onAuthStateChange` listener
- `ProtectedRoute` redireciona para `/login` se nao autenticado
- `auth.uid()` identifica o treinador — usado em RLS e como `coach_id` default
- `getUser()` para verificacao (nunca `getSession()`)
- Secrets do Supabase: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no client; `service_role_key` apenas em Edge Functions (se houver)

### Tema (Dark Mode)

- **Class strategy**: `[data-theme="dark"]` no elemento root
- CSS variables do design system remapeadas no dark theme (surfaces, text, borders, brand colors ajustados para legibilidade)
- Tailwind `dark:` variant configurada com `selector: '[data-theme="dark"]'`
- `ThemeContext` expoe `theme` (Claro/Escuro/Sistema) + `setTheme`
- Preferencia salva em `localStorage`; "Sistema" segue `prefers-color-scheme`

### Supabase Client

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Seguranca (do Security Review)

- RLS obrigatorio em todas as tabelas — habilitado na mesma migracao que cria a tabela
- Wrapper `(SELECT auth.uid())` em policies (evita re-execucao por linha)
- `SECURITY DEFINER` com `SET search_path = public` em funcoes
- `coach_id` nunca vem do client: `DEFAULT auth.uid()` na coluna + `WITH CHECK (coach_id = (SELECT auth.uid()))`
- Bucket `student-photos` privado: policies de storage vinculadas ao `coach_id`
- Fotos de alunos: upload com path `{coach_id}/{student_id}.{ext}`
- Anti-pattern evitado: policies SELECT aditivas no mesmo role (criam vazamento via OR)

### Build e Deploy

- **Vite config**: TypeScript strict, path alias `@/` → `./src/`, resolve de assets
- **Environment variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (expostas ao client via `import.meta.env`)
- **Google Fonts**: Archivo (display/stats) + Barlow (body/UI) + Barlow Semi Condensed (dense stats) — carregadas via `<link>` no `index.html`
- **Build output**: `dist/` — SPA, deploy via Vercel/Netlify/qualquer host estatico

## Mapeamento de Componentes Custom

Componentes que **nao** existem no shadcn/ui e precisam ser construidos do zero, baseados no design system:

| Componente | Pasta | Referencia no UI Kit | Descricao |
|-----------|-------|---------------------|-----------|
| `PlayerCard` | `components/students/` | `components.jsx` → PlayerCard | Card gamificado FUT com overall, fundamentos, V/D |
| `Avatar` | `components/students/` | `components.jsx` → Avatar | Iniciais com cor deterministica ou foto |
| `PresenceToggle` | `components/training/` | `components.jsx` → PresencaToggle | Toggle tristate: presente/falta/atraso |
| `TeamPanel` | `components/training/` | `components.jsx` → TeamPanel | Painel de roster de um time |
| `BalanceIndicator` | `components/training/` | `components.jsx` → BalanceIndicator | Indicador circular de equilibrio (%) |
| `Stepper` | `components/training/` | `components.jsx` → Stepper | +/- para contagem de sets |
| `StatBadge` | `components/students/` | `components.jsx` → StatBadge | Badge com valor numerico + label |
| `Scale5` | `components/students/` | `components.jsx` → Scale5 | Barra visual de rating 1-5 |
| `ResultCard` | `components/history/` | `components.jsx` → ResultCard | Card de resultado com times + sets |
| `BottomNav` | `components/layouts/` | `components.jsx` → BottomNav | Nav inferior com 4 tabs |
| `Header` | `components/layouts/` | `components.jsx` → Header | Header com titulo + opcoes |
| `EmptyState` | `components/layouts/` | `components.jsx` → EmptyState | Estado vazio com CTA |
| `InfoRow` | `components/manage/` | `screens-gerenciar.jsx` → InfoRow | Linha label/valor read-only |
| `PositionField` | `components/students/` | `components.jsx` → PositionField | Seletor principal + alternativas |
| `BuildOptions` | `components/training/` | `screens.jsx` → Montar opções | Modo/tamanho/tratamento de sobra |
| `SharePreview` | `components/share/` | `screens-share.jsx` → ShareCard | Preview do card para compartilhamento |

## Integrações Externas

### Supabase

- **Client:** `src/integrations/supabase/client.ts`
- **Tipos:** `src/integrations/supabase/types.ts` (gerado via `npx supabase gen types typescript --project-id alqagnftooeuzscomyku`)
- **Auth:** Email/password — `supabase.auth.signInWithPassword()`, `signUp()`, `resetPasswordForEmail()`
- **Storage:** Bucket `student-photos` (privado) — upload/download via `supabase.storage.from('student-photos')`
- **Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — apenas no client

### Google Fonts (CDN)

- Archivo: display, headlines, stat numbers
- Barlow: body, UI, labels
- Barlow Semi Condensed: dense stat blocks
- Carregadas via `<link>` no `index.html` (preconnect + stylesheet)

### html-to-image

- Geracao de imagem para compartilhamento (player card, resultado de partida)
- Roda client-side, sem backend
- Share via Web Share API (`navigator.share`) ou download direto
