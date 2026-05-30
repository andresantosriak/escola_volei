# Backlog — Esporte Recreacao

> App mobile-first para treinadores de volei recreativo: gestao de filiais, turmas e alunos;
> chamada rapida na quadra; engine de balanceamento automatico de times (600 iteracoes,
> local-swap, modos Competitivo/Desenvolvimento); registro de resultados set-a-set; avaliacao
> por treino com fundamentos configuraveis; player card gamificado; compartilhamento de imagem.
> Sprint 1 estabelece toda a fundacao (projeto, tokens, componentes base, migrations, auth).
> Sprints 2-3 cobrem gestao de estrutura (filiais, turmas, alunos). Sprint 4 implementa o
> fluxo core do treino (chamada + montar times). Sprint 5 fecha o ciclo com resultado e
> historico. Sprint 6 adiciona avaliacoes e compartilhamento. Sprint 7 cobre configuracoes
> e fundamentos. Sprint 8 faz integracao final, QA e polish. As 8 pendencias do Security
> Audit #2 estao distribuidas nas sprints relevantes.

**Sprints (ordem de execucao):**
1. Sprint 1 — Setup & Infraestrutura + Auth (objetivo: projeto rodando com auth, layout, tokens e migrations base)
2. Sprint 2 — Gestao de Filiais + Turmas (objetivo: CRUD completo de filiais e turmas)
3. Sprint 3 — Alunos (objetivo: CRUD de alunos com perfil, player card e vinculo a turmas)
4. Sprint 4 — Fluxo do Treino: Chamada + Montar Times (objetivo: chamada tri-state e engine de balance funcional)
5. Sprint 5 — Registrar Resultado + Historico (objetivo: registro de partidas set-a-set e historico navegavel)
6. Sprint 6 — Avaliacao + Compartilhamento (objetivo: avaliacao por treino e share de imagem)
7. Sprint 7 — Config + Fundamentos + Polish (objetivo: fundamentos configuraveis, settings, dark theme completo)
8. Sprint 8 — Integracao Final + QA (objetivo: app completo, testado, edge cases resolvidos)

**Gerado em:** 2026-05-30
**Baseado em:** PRD v1, Security Review v1, Architecture v1, ADR-001, Data Architecture (status), Security Audit #2 (status)

**Notas:**
- Stack: Vite + React 18 + TypeScript strict + Tailwind CSS v4 + shadcn/ui + Supabase
- Supabase project_id: alqagnftooeuzscomyku (ja provisionado)
- Engine de balance: converter data.js → TypeScript puro com seed RNG (ADR-002)
- Multi-tenant via RLS com auth.uid() em todas as tabelas (ADR-003)
- Dark theme: class strategy com [data-theme="dark"] e CSS variables
- Pendencias Security Audit #2 identificadas como SEC-C1, SEC-C2, SEC-A1, SEC-A2, SEC-A3, SEC-M1, SEC-M2, SEC-B1

**Avisos:**
- docs/escola-volei-stories.md nao encontrado no disco — stories derivadas do PRD + status file
- docs/escola-volei-design-system.md nao encontrado no disco — design tokens derivados da architecture
- docs/escola-volei-data-architecture.md nao encontrado no disco — schema derivado do PRD + security review + status (16 tabelas, 52 indices)

---

## Sprint 1 — Setup & Infraestrutura + Auth

**Objetivo da sprint:** Projeto Vite + React + TS rodando com Tailwind tokenizado (design system), shadcn/ui, Supabase client, layout base (AppLayout + Header + BottomNav + EmptyState), migrations de fundacao (profiles, filiais, turmas), e auth completo (login, registro, recuperacao de senha, rotas protegidas). Ao final, treinador consegue criar conta, fazer login e ver a home vazia.
**Pre-requisitos:** nenhum
**Definition of Done:** `npm run dev` inicia sem erros; login + registro funcionais; redirect para home apos auth; layout com header e bottom nav renderiza corretamente; RLS ativa nas tabelas base; tema claro/escuro funcional em nivel basico.

### Task 1.1 — Criar projeto Vite + React + TypeScript e instalar dependencias
- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, index.html, .env.example, .gitignore
- **Resultado esperado:** Projeto Vite inicializado com React 18, TypeScript strict, path alias `@/` → `./src/`. Dependencias instaladas: tailwindcss v4, @tailwindcss/vite, shadcn/ui (via CLI), @supabase/supabase-js, @tanstack/react-query, react-router-dom v6, react-hook-form, @hookform/resolvers, zod, lucide-react, sonner, html-to-image. `.env.example` com placeholders para VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (sem valores reais). Source maps desabilitados em producao: `build.sourcemap: false`.
- **Criterios de aceite:**
  - [ ] `npm run dev` inicia sem erros
  - [ ] TypeScript strict habilitado
  - [ ] Path alias `@/` funcional
  - [ ] `.env.example` criado com placeholders (SEC: nunca valores reais)
  - [ ] `.gitignore` inclui `.env*`, `node_modules/`, `dist/`, `.DS_Store`
  - [ ] `build.sourcemap: false` em vite.config.ts

### Task 1.2 — Configurar Tailwind CSS com tokens do Design System e Google Fonts
- **Tipo:** chore
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.1
- **Arquivos esperados:** src/styles/globals.css, src/styles/fonts.css, tailwind.config.ts (se necessario alem do CSS), index.html
- **Resultado esperado:** Tailwind v4 configurado com CSS variables do design system: cores (brand green #2ECC71 primary, surfaces, states), tipografia (Archivo display + Barlow body + Barlow Semi Condensed), espacamento (4px base), border-radius (12/16/20px), sombras. Dark theme via `[data-theme="dark"]` com cores remapeadas (surfaces navy, brand green mais brilhante, sem preto puro). Google Fonts carregadas via `<link>` no index.html com preconnect.
- **Criterios de aceite:**
  - [ ] CSS variables definidas para light e dark themes
  - [ ] Dark variant configurada com `selector: '[data-theme="dark"]'`
  - [ ] Fontes Archivo e Barlow carregando
  - [ ] Cores de brand, surfaces, text e states disponiveis como classes Tailwind

### Task 1.3 — Inicializar shadcn/ui e criar componentes atom base
- **Tipo:** chore
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.2
- **Arquivos esperados:** components.json, src/lib/utils.ts, src/components/ui/button.tsx, src/components/ui/input.tsx, src/components/ui/sheet.tsx, src/components/ui/tabs.tsx, src/components/ui/badge.tsx, src/components/ui/toggle.tsx, src/components/ui/select.tsx, src/components/ui/dialog.tsx, src/components/ui/toast.tsx (sonner)
- **Resultado esperado:** shadcn/ui inicializado com componentes base instalados via CLI e customizados com tokens do design system (border-radius, cores, font-family). `cn()` utility em `src/lib/utils.ts`. Sonner configurado como provider de toast.
- **Criterios de aceite:**
  - [ ] shadcn/ui funcional com tema customizado
  - [ ] `cn()` disponivel em `@/lib/utils`
  - [ ] Componentes renderizam com visual do design system (green brand, radius 12px)
  - [ ] Sonner provisionado para notificacoes

### Task 1.4 — Configurar Supabase client e React Query provider
- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** Task 1.1
- **Arquivos esperados:** src/integrations/supabase/client.ts, src/integrations/supabase/types.ts, src/app/providers.tsx
- **Resultado esperado:** Supabase client inicializado com tipos gerados. QueryClientProvider configurado com defaults (staleTime, gcTime). Providers aninhados: QueryClient → Auth → Theme.
- **Criterios de aceite:**
  - [ ] `supabase` client exportado e tipado
  - [ ] QueryClientProvider envolvendo o app
  - [ ] Apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` usadas no client (SEC)

### Task 1.5 — Criar layout base: AppLayout, Header, BottomNav, EmptyState
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 1.3
- **Arquivos esperados:** src/components/layouts/AppLayout.tsx, src/components/layouts/Header.tsx, src/components/layouts/BottomNav.tsx, src/components/layouts/EmptyState.tsx
- **Resultado esperado:** AppLayout com Header (top) + BottomNav (bottom) + content area (scrollavel). BottomNav com 4 tabs (Inicio, Historico, Alunos, Menu) usando icones Lucide, highlight na tab ativa. Header com titulo dinamico + back button. EmptyState reutilizavel com icone + titulo + descricao + CTA. Tudo mobile-first (base 390px), touch targets >= 48px.
- **Criterios de aceite:**
  - [ ] Layout renderiza header + content + bottom nav
  - [ ] BottomNav destaca tab ativa via React Router
  - [ ] EmptyState aceita props customizaveis
  - [ ] Touch targets >= 48px em todos os interativos
  - [ ] Responsivo mobile-first

### Task 1.6 — Criar migration base: profiles, filiais, turmas + RLS + indices
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 1.4
- **Stories cobertas:** US-001 (auth), US-002 (filiais), US-003 (turmas)
- **Arquivos esperados:** supabase/migrations/001_foundation.sql
- **Resultado esperado:** Migration atomica com: tabela `profiles` (id, full_name, email, avatar_url, created_at, updated_at) com trigger on auth.users insert; tabela `filiais` (id, coach_id DEFAULT auth.uid(), nome, cidade, endereco, telefone, responsavel, archived, created_at, updated_at); tabela `turmas` (id, filial_id FK, nome, dias_semana, horario, nivel, faixa_etaria, professor, archived, created_at, updated_at). RLS habilitado em todas as tabelas na mesma migration. Policies com wrapper `(SELECT auth.uid())`. Indices em coach_id, filial_id, e todas as colunas referenciadas em policies. Trigger `updated_at` automatico. (SEC-C1: usar `SECURITY INVOKER` em views se criadas nesta migration; SEC-C2: criar indice para otimizar EXISTS em policies de cadeia).
- **Criterios de aceite:**
  - [ ] Tabelas criadas com RLS ativo
  - [ ] Policies SELECT/INSERT/UPDATE/DELETE para cada tabela
  - [ ] Wrapper `(SELECT auth.uid())` em todas as policies
  - [ ] Indices em coach_id, filial_id
  - [ ] Trigger updated_at funcional
  - [ ] Migration roda sem erros via `npx supabase db push`
- **Acoes manuais do desenvolvedor:**
  - [ ] Executar `npx supabase db push` apos criar migration
  - [ ] Configurar rate limiting no Supabase Dashboard (Auth > Rate Limits) (SEC)
  - [ ] Habilitar email confirmation no Supabase Dashboard (Auth > Providers > Email) (SEC)
  - [ ] Configurar Site URL e Redirect URLs no Dashboard (SEC)

### Task 1.7 — Implementar autenticacao completa: login, registro, recuperacao de senha, rotas protegidas
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 1.5, Task 1.6
- **Stories cobertas:** US-001
- **Arquivos esperados:** src/contexts/auth-context.tsx, src/hooks/use-auth.ts, src/services/auth-service.ts, src/schemas/auth-schema.ts, src/components/auth/ProtectedRoute.tsx, src/components/auth/AuthForm.tsx, src/pages/Login.tsx, src/pages/Register.tsx, src/pages/ForgotPassword.tsx, src/pages/ResetPassword.tsx, src/app/router.tsx, src/app/App.tsx
- **Resultado esperado:** Auth completo com Supabase: login (email/senha), registro, recuperacao de senha, reset via link. AuthContext com `onAuthStateChange` listener. ProtectedRoute redirect para /login. Router com todas as rotas (publicas + protegidas). Validacao com Zod. Mensagens genericas em login/signup (nunca revelar se email existe). `getUser()` para verificacao (nunca `getSession()`). Tratamento de erro com sonner.
- **Criterios de aceite:**
  - [ ] Login e registro funcionais com feedback de erro
  - [ ] Mensagens genericas (SEC: nao revelar existencia de email)
  - [ ] Rotas protegidas redirecionam para /login se nao autenticado
  - [ ] Logout limpa sessao
  - [ ] Recuperacao de senha envia email e reset funciona
  - [ ] `getUser()` usado (nunca `getSession()`) (SEC)
  - [ ] Formularios validados com Zod

---

## Sprint 2 — Gestao de Filiais + Turmas

**Objetivo da sprint:** CRUD completo de filiais (criar, editar, visualizar, arquivar, excluir com lock) e turmas (criar, editar, visualizar, filtrar por filial, roster de alunos). Treinador consegue montar sua estrutura organizacional completa.
**Pre-requisitos:** Sprint 1 concluida
**Definition of Done:** Filial criada, editada, arquivada e excluida (com lock); turma criada, editada, vinculada a filial; filtro de turmas por filial funcional; InfoRow e ListRow renderizam corretamente.

### Task 2.1 — Criar componentes InfoRow e ListRow
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** src/components/manage/InfoRow.tsx, src/components/manage/ListRow.tsx
- **Resultado esperado:** InfoRow: linha read-only com label + valor (usado em detail views). ListRow: linha clicavel com titulo + subtitulo + chevron (usado em listas). Ambos mobile-first com touch targets >= 48px.
- **Criterios de aceite:**
  - [ ] InfoRow renderiza label/valor alinhados
  - [ ] ListRow renderiza com chevron e onClick
  - [ ] Touch targets >= 48px

### Task 2.2 — Implementar service + hook + schema de Filiais
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** US-002
- **Arquivos esperados:** src/services/branch-service.ts, src/hooks/use-branches.ts, src/schemas/branch-schema.ts
- **Resultado esperado:** Service com CRUD completo no Supabase (create, read, update, archive, delete). Hook com useQuery (lista + detalhe) e useMutation (create, update, archive, delete). Schema Zod com validacao de campos (nome obrigatorio, telefone formato validado, max 100 chars em nome). Delete so permitido se filial nao tem turmas ativas (verificacao no service). `invalidateQueries` apos mutations.
- **Criterios de aceite:**
  - [ ] CRUD funcional no Supabase
  - [ ] Validacao Zod em todos os campos
  - [ ] Delete bloqueado se filial tem turmas (RN06)
  - [ ] invalidateQueries apos mutations

### Task 2.3 — Implementar telas de Filiais: lista, detalhe, criacao, edicao
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 2.1, Task 2.2
- **Stories cobertas:** US-002
- **Arquivos esperados:** src/pages/manage/Branches.tsx, src/pages/manage/BranchDetail.tsx
- **Resultado esperado:** Branches: lista de filiais do treinador com ListRow, filtro ativo/arquivado, botao "Nova filial". BranchDetail: modo view (InfoRows) com botoes editar/arquivar/excluir; modo edit/new com form (React Hook Form + Zod). Delete com Sheet de confirmacao irreversivel. Lock de exclusao quando ha turmas ativas (RN06): botao desabilitado com explicacao. Empty state quando nao ha filiais. Loading e error states.
- **Criterios de aceite:**
  - [ ] Lista de filiais renderiza com dados reais
  - [ ] Criar filial funciona e volta pra lista
  - [ ] Editar filial pre-preenche form e salva
  - [ ] Arquivar toggle funcional
  - [ ] Excluir com confirmacao irreversivel (Sheet)
  - [ ] Lock de exclusao com mensagem explicativa (RN06)
  - [ ] Empty state na lista vazia

### Task 2.4 — Implementar service + hook + schema de Turmas
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 2.2
- **Stories cobertas:** US-003
- **Arquivos esperados:** src/services/class-service.ts, src/hooks/use-classes.ts, src/schemas/class-schema.ts
- **Resultado esperado:** Service com CRUD completo de turmas vinculadas a filiais. Hook com queries filtradas por filial. Schema Zod com validacao (nome, dias_semana como array, horario, nivel, faixa_etaria). Query key hierarquica: `['classes', { branchId }]`.
- **Criterios de aceite:**
  - [ ] CRUD funcional vinculado a filial
  - [ ] Filtro por filial via query key
  - [ ] Validacao Zod nos campos
  - [ ] invalidateQueries apos mutations

### Task 2.5 — Implementar telas de Turmas: lista, detalhe, criacao, edicao
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 2.1, Task 2.4
- **Stories cobertas:** US-003
- **Arquivos esperados:** src/pages/manage/Classes.tsx, src/pages/manage/ClassDetail.tsx
- **Resultado esperado:** Classes: lista de turmas filtrada por filial (select no topo), com roster resumido. ClassDetail: modo view com info da turma + lista de alunos vinculados; modo edit/new com form. Empty state quando nao ha turmas. Loading e error states.
- **Criterios de aceite:**
  - [ ] Lista de turmas renderiza com filtro por filial
  - [ ] Criar turma vinculada a filial funciona
  - [ ] Editar turma pre-preenche e salva
  - [ ] Roster de alunos visivel no detalhe
  - [ ] Empty state na lista vazia

### Task 2.6 — Criar migration de alunos e turma_alunos (pivot) + RLS + indices
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** US-004
- **Arquivos esperados:** supabase/migrations/002_alunos.sql
- **Resultado esperado:** Migration atomica com: tabela `alunos` (id, coach_id DEFAULT auth.uid(), nome, data_nascimento, genero, altura, mao_dominante, posicao_principal, posicoes_alternativas text[], contato_responsavel, nome_responsavel, observacoes, foto_url, created_at, updated_at); tabela `turma_alunos` (turma_id FK, aluno_id FK, joined_at, PK composta). RLS em ambas. Policies com cadeia turma → filial → coach_id para turma_alunos. Indices em coach_id, turma_id, aluno_id. (SEC-C2: indice composto para otimizar EXISTS na cadeia de ownership).
- **Criterios de aceite:**
  - [ ] Tabelas criadas com RLS ativo
  - [ ] Cadeia de ownership funcional via policies
  - [ ] Indices criados para performance de RLS
  - [ ] Migration roda sem erros
- **Acoes manuais do desenvolvedor:**
  - [ ] Executar `npx supabase db push`

---

## Sprint 3 — Alunos

**Objetivo da sprint:** CRUD completo de alunos com perfil em 2 abas (Dados + Desempenho), PlayerCard gamificado, Avatar com iniciais, seletor de posicao, vinculo a turmas. Treinador consegue cadastrar todos os alunos e ver o player card de cada um.
**Pre-requisitos:** Sprint 2 concluida
**Definition of Done:** Aluno cadastrado com todos os campos; perfil com 2 abas funcional; PlayerCard com overall e fundamentos renderiza; Avatar com iniciais coloridas; aluno vinculado a turma; empty state de amostra insuficiente (RN11).

### Task 3.1 — Criar componentes Avatar, PlayerCard, StatBadge, PositionField, Scale5
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** src/components/students/Avatar.tsx, src/components/students/PlayerCard.tsx, src/components/students/StatBadge.tsx, src/components/students/PositionField.tsx, src/components/students/Scale5.tsx
- **Resultado esperado:** Avatar: iniciais com cor deterministica por nome (hash → cor) ou foto se disponivel. PlayerCard: card gamificado estilo FUT com overall (48-98), nome, posicao, 6 fundamentos tecnicos em hexagono/barras, V/D. StatBadge: badge compacto com valor numerico + label. PositionField: seletor de posicao principal (radio) + alternativas (checkboxes) com opcoes LEV, LIB, OPO, PON, CEN. Scale5: barra visual de rating 1-5 com preenchimento proporcional.
- **Criterios de aceite:**
  - [ ] Avatar renderiza iniciais com cor consistente
  - [ ] PlayerCard exibe overall calculado (RN01)
  - [ ] PositionField permite selecionar principal + alternativas
  - [ ] Scale5 renderiza barras proporcionais
  - [ ] Todos responsivos e mobile-first

### Task 3.2 — Implementar service + hook + schema de Alunos
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** US-004
- **Arquivos esperados:** src/services/student-service.ts, src/hooks/use-students.ts, src/schemas/student-schema.ts
- **Resultado esperado:** Service com CRUD de alunos + vinculo a turmas (insert/delete em turma_alunos). Hook com queries por turma e por id. Schema Zod com validacao: nome (obrigatorio, max 100), data_nascimento (date), genero (enum), altura (range), mao_dominante (enum), posicao_principal (enum), posicoes_alternativas (array), contato/responsavel. Calculo do geral conforme RN01 derivado dos fundamentos.
- **Criterios de aceite:**
  - [ ] CRUD funcional com vinculo a turma
  - [ ] Validacao Zod em todos os campos
  - [ ] Range validation em campos numericos (SEC)
  - [ ] Query por turma e por id funcionais

### Task 3.3 — Implementar tela de Lista de Alunos (StudentList)
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 3.1, Task 3.2
- **Stories cobertas:** US-004
- **Arquivos esperados:** src/pages/students/StudentList.tsx
- **Resultado esperado:** Lista de alunos da turma selecionada com Avatar + nome + overall + posicao. Filtro por turma (select). Botao "Novo aluno". Ordenacao por nome ou overall. Empty state quando nao ha alunos.
- **Criterios de aceite:**
  - [ ] Lista renderiza com Avatar e info resumida
  - [ ] Filtro por turma funcional
  - [ ] Navegacao para detalhe do aluno ao tocar
  - [ ] Empty state visivel

### Task 3.4 — Implementar tela de Perfil do Aluno (StudentDetail) com 2 abas
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 3.1, Task 3.2
- **Stories cobertas:** US-004
- **Arquivos esperados:** src/pages/students/StudentDetail.tsx
- **Resultado esperado:** Aba Dados: form de edicao com todos os campos (nome, nascimento, genero, altura, mao, posicao, turmas, contato/responsavel, observacoes). Aba Desempenho: PlayerCard gamificado + stats (V/D, partidas, fundamentos). Se aluno tem <5 partidas: aviso "Amostra insuficiente" (RN11). Botoes: salvar, excluir (com confirmacao). Header com back button.
- **Criterios de aceite:**
  - [ ] Aba Dados com form editavel e salvamento
  - [ ] Aba Desempenho com PlayerCard + stats
  - [ ] Aviso de amostra insuficiente se <5 partidas (RN11)
  - [ ] Tabs funcionais e responsivas
  - [ ] Excluir com confirmacao

### Task 3.5 — Criar migration de fundamentos_config e aluno_fundamentos + RLS
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** US-013
- **Arquivos esperados:** supabase/migrations/003_fundamentos.sql
- **Resultado esperado:** Tabela `fundamentos_config` (id, coach_id DEFAULT auth.uid(), key UNIQUE(coach_id, key), nome, tipo enum(tecnico, comportamental), escala int CHECK(escala IN (3,5,10)), peso numeric DEFAULT 1.0 CHECK(peso BETWEEN 0.5 AND 2.0), ativo boolean DEFAULT true, ordem int, created_at). Tabela `aluno_fundamentos` (aluno_id FK, fundamento_config_id FK, valor int, updated_at, PK composta). RLS em ambas com coach_id. Seed de fundamentos padrao (6 tecnicos + 5 comportamentais). (SEC-A1: imutabilidade de fundamentos_config.key via trigger — UPDATE em key bloqueado com exception; SEC-A2: CHECK constraint de valor conforme escala — trigger ou constraint que valide valor BETWEEN 1 AND escala do fundamento).
- **Criterios de aceite:**
  - [ ] Tabelas criadas com RLS
  - [ ] Seed de fundamentos padrao inserido
  - [ ] Key imutavel apos criacao (SEC-A1: trigger bloqueia UPDATE em key)
  - [ ] CHECK de valor por escala funcional (SEC-A2)
  - [ ] Indices em coach_id e aluno_id

---

## Sprint 4 — Fluxo do Treino: Chamada + Montar Times

**Objetivo da sprint:** Fluxo core do app — treinador seleciona turma na home, faz chamada rapida (toggle tri-state), e monta times equilibrados com engine automatica. Inclui swap manual, reequilibrar, e balance indicator. Engine de balance convertida de JS para TypeScript com seed RNG.
**Pre-requisitos:** Sprint 3 concluida
**Definition of Done:** Chamada funcional com toggle presente/falta/atraso; engine monta 2 times equilibrados com >=4 presentes; modos Competitivo e Desenvolvimento funcionam; swap manual recalcula indice; BalanceIndicator exibe %; constraint de levantador com aviso.

### Task 4.1 — Implementar Home screen com selecao de turma e iniciar treino
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** US-005
- **Arquivos esperados:** src/pages/Home.tsx
- **Resultado esperado:** Home com selecao de turma (filtro por filial), contagem de alunos, botao "Iniciar treino" que navega para /training/attendance com turma selecionada. Estado da turma em contexto ou query param. Empty state se nao ha turmas cadastradas.
- **Criterios de aceite:**
  - [ ] Selecao de turma funcional
  - [ ] Botao "Iniciar treino" navega com turma
  - [ ] Empty state se nao ha turmas
  - [ ] Contagem de alunos por turma visivel

### Task 4.2 — Criar componente PresenceToggle (tri-state)
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** src/components/training/PresenceToggle.tsx
- **Resultado esperado:** Toggle ciclico com 3 estados: Presente (verde, check), Falta (vermelho, X), Atraso (amarelo, relogio). Icone + cor muda a cada toque. Touch target >= 48px. Estado controlado via props (value + onChange).
- **Criterios de aceite:**
  - [ ] Cicla entre 3 estados ao tocar
  - [ ] Cores e icones corretos por estado
  - [ ] Touch target >= 48px
  - [ ] Componente controlado (props)

### Task 4.3 — Implementar tela de Chamada (Attendance)
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 4.1, Task 4.2
- **Stories cobertas:** US-005
- **Arquivos esperados:** src/pages/training/Attendance.tsx
- **Resultado esperado:** Lista de todos os alunos da turma com Avatar + nome + PresenceToggle. Contador "X/total confirmados" no header. Default: todos presentes. Botao "Montar times" habilitado com >=4 presentes, desabilitado com <4 (com tooltip explicativo). Header com back button e titulo da turma.
- **Criterios de aceite:**
  - [ ] Lista de alunos com toggle tri-state
  - [ ] Contador atualiza em tempo real
  - [ ] "Montar times" habilitado so com >=4 presentes
  - [ ] Default: todos presentes

### Task 4.4 — Converter engine de balance para TypeScript puro com seed RNG
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** US-006
- **Arquivos esperados:** src/engine/build-teams.ts, src/engine/balance-score.ts, src/engine/tier-map.ts, src/engine/types.ts
- **Resultado esperado:** Engine completa em TypeScript puro (sem dependencias React ou Supabase). Funcoes: `buildTeams(players, options)` com 600 iteracoes + local-swap (ADR-002). `balanceScore(t1, t2)` com calculo de fundDiff, forceTerm, penalidade de levantador, clamped 20-99 (RN03). `tierMap(players)` com classificacao topo/meio/base (RN04). Seed RNG deterministica para reprodutibilidade em testes. Modos: Competitivo (maximizar balanceScore) e Desenvolvimento (forcar mistura de niveis + equilibrio). Constraint de levantador: >=1 por time. Tipos completos exportados.
- **Criterios de aceite:**
  - [ ] buildTeams retorna 2 times equilibrados
  - [ ] Modo Competitivo maximiza indice
  - [ ] Modo Desenvolvimento mistura niveis (topo+base em cada time) (RN02/RN04)
  - [ ] balanceScore calcula conforme RN03 (clamped 20-99)
  - [ ] Constraint de levantador funciona (RN05)
  - [ ] Seed RNG deterministica para testes
  - [ ] Pure functions sem side effects
  - [ ] Executa <500ms com 14 jogadores

### Task 4.5 — Criar componentes TeamPanel, BalanceIndicator, BuildOptions, Stepper
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** src/components/training/TeamPanel.tsx, src/components/training/BalanceIndicator.tsx, src/components/training/BuildOptions.tsx, src/components/training/Stepper.tsx
- **Resultado esperado:** TeamPanel: painel de um time com nome editavel, lista de jogadores (Avatar + nome + posicao + overall), forca total, cor de fundo. BalanceIndicator: indicador visual de equilibrio (%) com cor graduada (verde >80, amarelo 60-80, vermelho <60), badges topo/meio/base por time. BuildOptions: selecao de modo (Competitivo/Desenvolvimento), tamanho (6x6, 7x7, etc.), tratamento de sobra (Banco/Rodizio). Stepper: +/- para contagem de sets.
- **Criterios de aceite:**
  - [ ] TeamPanel renderiza roster com stats
  - [ ] BalanceIndicator mostra % com cor graduada
  - [ ] BuildOptions permite selecao de modo/tamanho/sobra
  - [ ] Stepper incrementa/decrementa com limites

### Task 4.6 — Implementar tela de Montar Times (BuildTeams)
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 4.4, Task 4.5
- **Stories cobertas:** US-006
- **Arquivos esperados:** src/pages/training/BuildTeams.tsx, src/hooks/use-team-builder.ts
- **Resultado esperado:** Tela recebe lista de presentes da chamada. BuildOptions no topo. Engine roda automaticamente ao abrir. 2 TeamPanels lado a lado (mobile: empilhados). BalanceIndicator entre/acima dos panels. Toque em jogador permite trocar de time (indice recalcula live). Botao "Reequilibrar" roda nova divisao. Aviso se nao ha levantadores suficientes (RN05). Sobra vai pro banco (mostrar bench section). Botao "Registrar resultado" navega para proxima tela.
- **Criterios de aceite:**
  - [ ] Engine monta times ao abrir com presentes
  - [ ] Swap manual entre times funciona (toque no jogador)
  - [ ] Indice recalcula apos swap
  - [ ] "Reequilibrar" gera nova divisao
  - [ ] Aviso de falta de levantador visivel (RN05)
  - [ ] Modos Competitivo e Desenvolvimento alternam
  - [ ] Banco/Rodizio para sobra

### Task 4.7 — Criar migration de treinos e presencas + RLS
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** supabase/migrations/004_treinos.sql
- **Resultado esperado:** Tabela `treinos` (id, turma_id FK, coach_id DEFAULT auth.uid(), data date DEFAULT now(), notas text, created_at). Tabela `presencas` (treino_id FK, aluno_id FK, status enum(presente, falta, atraso), PK composta). RLS em ambas com cadeia de ownership via turma → filial → coach_id. Indices em turma_id, coach_id, data.
- **Criterios de aceite:**
  - [ ] Tabelas criadas com RLS
  - [ ] Cadeia de ownership funcional
  - [ ] Indices criados
  - [ ] Migration roda sem erros

---

## Sprint 5 — Registrar Resultado + Historico

**Objetivo da sprint:** Treinador registra resultado de partidas (sets com +/-, formatos variados, vencedor auto/manual/W.O.) e navega pelo historico com detalhe de cada partida (set-by-set, elencos, equilibrio, forca). "Salvar e registrar outra" permite multiplas partidas no mesmo treino.
**Pre-requisitos:** Sprint 4 concluida
**Definition of Done:** Partida registrada com sets, vencedor calculado automaticamente; historico lista todas as partidas; detalhe mostra set-by-set + elencos + equilibrio; "salvar e registrar outra" funcional; ResultCard renderiza na lista.

### Task 5.1 — Criar migration de partidas, partida_sets e partida_elencos + RLS
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** supabase/migrations/005_partidas.sql
- **Resultado esperado:** Tabela `partidas` (id, treino_id FK, turma_id FK, coach_id, formato enum(set_unico, melhor_de_3, melhor_de_5, por_tempo), vencedor enum(time_a, time_b, empate, wo_a, wo_b), vencedor_manual boolean DEFAULT false, indice_equilibrio numeric, forca_time_a numeric, forca_time_b numeric, created_at). Tabela `partida_sets` (id, partida_id FK, numero int, pontos_time_a int, pontos_time_b int). Tabela `partida_elencos` (partida_id FK, aluno_id FK, time enum(a, b, banco), PK composta). RLS em todas com cadeia de ownership. Indices.
- **Criterios de aceite:**
  - [ ] Tabelas criadas com RLS
  - [ ] Foreign keys corretas
  - [ ] Indice de equilibrio e forca persistidos
  - [ ] Migration roda sem erros

### Task 5.2 — Implementar service + hook + schema de Partidas
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 5.1
- **Stories cobertas:** US-007
- **Arquivos esperados:** src/services/match-service.ts, src/hooks/use-matches.ts, src/schemas/match-schema.ts
- **Resultado esperado:** Service com create (partida + sets + elencos em transacao), read (lista por turma + detalhe), update, delete. Schema Zod com validacao de formato, sets (pontos >= 0), elencos. Calculo automatico de vencedor baseado nos sets (RN07). Hook com queries hierarquicas.
- **Criterios de aceite:**
  - [ ] Create persiste partida + sets + elencos atomicamente
  - [ ] Vencedor calculado automaticamente (RN07)
  - [ ] Validacao Zod em pontos e formato
  - [ ] Query por turma e por id

### Task 5.3 — Implementar tela de Registrar Resultado (RegisterResult)
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 5.2, Task 4.5
- **Stories cobertas:** US-007
- **Arquivos esperados:** src/pages/training/RegisterResult.tsx
- **Resultado esperado:** Tela com: selecao de formato (Set unico / Melhor de 3 / Melhor de 5 / Por tempo). Sets editaveis com Stepper (+/-) para cada time. Adicionar/remover set. Vencedor: auto (quem ganhou mais sets), manual (treinador escolhe), W.O. Aviso se set empatado. "Salvar e registrar outra partida" redireciona pra nova partida no mesmo treino (RN07). "Salvar e finalizar" volta ao historico. Elencos dos times recebidos via state da tela anterior.
- **Criterios de aceite:**
  - [ ] 4 formatos de partida funcionais (RN07)
  - [ ] Sets editaveis com Stepper
  - [ ] Vencedor auto/manual/W.O. correto
  - [ ] Aviso visual em set empatado
  - [ ] "Salvar e registrar outra" funcional
  - [ ] Elencos persistidos com a partida

### Task 5.4 — Criar componente ResultCard
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** src/components/history/ResultCard.tsx, src/components/history/SetScoreRow.tsx
- **Resultado esperado:** ResultCard: card de resultado na lista de historico com nomes dos times, placar resumido, data, indice de equilibrio, icone de formato. SetScoreRow: linha de placar de um set (Time A pts - pts Time B, destaque no vencedor).
- **Criterios de aceite:**
  - [ ] ResultCard exibe info resumida da partida
  - [ ] SetScoreRow destaca vencedor do set
  - [ ] Visual mobile-first e legivel

### Task 5.5 — Implementar telas de Historico e Detalhe da Partida
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 5.2, Task 5.4
- **Stories cobertas:** US-008, US-009
- **Arquivos esperados:** src/pages/history/MatchHistory.tsx, src/pages/history/MatchDetail.tsx
- **Resultado esperado:** MatchHistory: lista de partidas com ResultCard, filtro por turma, ordenacao por data decrescente. Paginacao ou scroll infinito se >100 partidas. MatchDetail: set-by-set completo, elencos dos 2 times com Avatar + nome + posicao, indice de equilibrio na montagem, forca de cada time. Botoes de acao: editar, excluir (confirmacao), compartilhar (navega pra share), ver avaliacoes do treino. Header com back button.
- **Criterios de aceite:**
  - [ ] Lista de historico renderiza com filtro
  - [ ] Detalhe mostra sets, elencos, equilibrio, forca
  - [ ] Botoes de acao funcionais (editar, excluir, share, avaliacoes)
  - [ ] Paginacao se muitas partidas
  - [ ] Empty state no historico vazio

---

## Sprint 6 — Avaliacao + Compartilhamento

**Objetivo da sprint:** Avaliacao por treino (engajamento 1-5, ajustes de fundamento up/down, soft skills expandiveis, observacao) e compartilhamento de resultado/player card como imagem (3 formatos, 3 temas, toggles).
**Pre-requisitos:** Sprint 5 concluida
**Definition of Done:** Avaliacao por treino funcional com todos os campos; notas alimentam player card e geral; share gera imagem nos 3 formatos e 3 temas; toggles de elenco/sets/equilibrio funcionais; compartilhar via share API nativa.

### Task 6.1 — Criar migration de avaliacoes e avaliacao_fundamentos + RLS
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** supabase/migrations/006_avaliacoes.sql
- **Resultado esperado:** Tabela `avaliacoes` (id, treino_id FK, aluno_id FK, coach_id, engajamento int CHECK(1-5), observacao text, created_at, updated_at, UNIQUE(treino_id, aluno_id)). Tabela `avaliacao_fundamentos` (avaliacao_id FK, fundamento_config_id FK, valor_anterior int, valor_novo int, PK composta). RLS em ambas. Soft skills como fundamentos do tipo 'comportamental' em fundamentos_config (ja incluidos no seed). Trigger para atualizar `aluno_fundamentos.valor` quando avaliacao e salva.
- **Criterios de aceite:**
  - [ ] Tabelas criadas com RLS
  - [ ] Constraint UNIQUE(treino_id, aluno_id) impede duplicata
  - [ ] Trigger atualiza aluno_fundamentos.valor ao salvar avaliacao
  - [ ] Range check em engajamento (1-5)

### Task 6.2 — Implementar service + hook + schema de Avaliacoes
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 6.1
- **Stories cobertas:** US-012
- **Arquivos esperados:** src/services/evaluation-service.ts, src/hooks/use-evaluations.ts, src/schemas/evaluation-schema.ts
- **Resultado esperado:** Service com create/update de avaliacao (engajamento + ajustes de fundamentos + soft skills + observacao). Hook com query por treino e por aluno. Schema Zod. Ajustes de fundamento registram valor anterior e novo (delta visivel como up/down badge).
- **Criterios de aceite:**
  - [ ] CRUD de avaliacao funcional
  - [ ] Ajustes de fundamento persistem anterior/novo
  - [ ] Validacao Zod
  - [ ] Query por treino (listar presentes) e por aluno

### Task 6.3 — Implementar tela de Avaliacoes por Treino
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 6.2, Task 3.1
- **Stories cobertas:** US-012
- **Arquivos esperados:** src/pages/training/EvaluatePlayer.tsx
- **Resultado esperado:** Tela com lista de alunos presentes no treino. Para cada aluno: engajamento 1-5 (Scale5 ou rating), fundamentos tecnicos com nivel atual + botoes up/down (apenas o que mudou gera ajuste — RN08), soft skills expandiveis (Comportamento, Proatividade, Apoio ao time, Comunicacao, Esforco — cada um 1-5), observacao (textarea). "Salvar e proximo" agiliza o fluxo. Badge de ajuste (up/down) visivel. Loading state.
- **Criterios de aceite:**
  - [ ] Lista de presentes no treino
  - [ ] Engajamento 1-5 funcional
  - [ ] Ajustes de fundamento com up/down (RN08)
  - [ ] Soft skills expandiveis
  - [ ] "Salvar e proximo" funcional
  - [ ] Badges de ajuste visiveis

### Task 6.4 — Implementar Share Engine: gerador de imagem + ShareCard + SharePreview
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 5.5, Task 3.1
- **Stories cobertas:** US-010, US-011
- **Arquivos esperados:** src/pages/share/ShareCard.tsx, src/components/share/SharePreview.tsx, src/hooks/use-share-image.ts
- **Resultado esperado:** ShareCard: tela com preview da imagem + opcoes. Suporta 2 sujeitos: resultado de partida e player card do aluno. 3 formatos: Quadrado (300x300), Vertical (300x533), Paisagem (340x191). 3 temas: Verde (gradiente brand), Escuro (navy gradient), Claro (white gradient). Toggles (resultado): incluir elencos, incluir sets, incluir equilibrio. Geracao via html-to-image (client-side). Acoes: salvar na galeria (download), compartilhar (Web Share API). Loading overlay "Gerando imagem..." durante processamento. (SEC-A3: signed URLs com TTL curto se imagens de alunos forem usadas no card).
- **Criterios de aceite:**
  - [ ] 3 formatos geram imagens corretas (RN12)
  - [ ] 3 temas aplicam gradientes corretos
  - [ ] Toggles alteram conteudo da imagem
  - [ ] Download funciona
  - [ ] Web Share API funciona em mobile
  - [ ] Loading state durante geracao
  - [ ] Player card e resultado como sujeitos separados

---

## Sprint 7 — Config + Fundamentos + Polish

**Objetivo da sprint:** Fundamentos configuraveis (escala, pesos, on/off, reordenar, custom), configuracoes do app (conta, tema, unidade, tamanho time, modo montagem, exportar CSV), dark theme completo, e polish de empty/loading/error states em todas as telas.
**Pre-requisitos:** Sprint 6 concluida
**Definition of Done:** Fundamentos configuraveis com todos os controles; settings persitem; tema escuro completo em todas as telas; CSV exporta dados de alunos; todos os empty states implementados conforme design system.

### Task 7.1 — Implementar service + hook + schema de Fundamentos Config
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Stories cobertas:** US-013
- **Arquivos esperados:** src/services/skills-config-service.ts, src/hooks/use-skills-config.ts, src/schemas/skills-config-schema.ts
- **Resultado esperado:** Service com CRUD de fundamentos_config (update escala, peso, ativo, ordem; create custom; nunca delete). Hook com query por coach. Schema Zod com validacao de escala (3/5/10), peso (0.5-2.0), nome (max 50). Regra: pelo menos 1 fundamento ativo (validacao no service). (SEC-A1: key imutavel — service nunca envia update em key).
- **Criterios de aceite:**
  - [ ] CRUD funcional
  - [ ] Pelo menos 1 fundamento ativo (RN09)
  - [ ] Key nunca atualizada (SEC-A1)
  - [ ] Validacao de escala e peso

### Task 7.2 — Implementar tela de Fundamentos Config (Skills)
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** Task 7.1
- **Stories cobertas:** US-013
- **Arquivos esperados:** src/pages/manage/Skills.tsx
- **Resultado esperado:** Tela com 2 secoes: Tecnicos e Comportamentais. Cada fundamento: toggle on/off, nome, escala (select 3/5/10), peso com slider (x1.0-x1.4, visivel com toggle "Mostrar pesos"). Drag-to-reorder (via drag handle). Botao "Adicionar fundamento custom". Alerta se tentar desativar o ultimo fundamento ativo (RN09).
- **Criterios de aceite:**
  - [ ] Toggle on/off funcional
  - [ ] Escala configuravel (3/5/10)
  - [ ] Pesos com slider (modo avancado toggle)
  - [ ] Drag-to-reorder funcional
  - [ ] Adicionar custom funciona
  - [ ] Validacao: ao menos 1 ativo

### Task 7.3 — Implementar tela de Configuracoes (Settings) + persistencia
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** media
- **Dependencias:** nenhuma
- **Stories cobertas:** US-014
- **Arquivos esperados:** src/pages/manage/Settings.tsx, src/lib/constants.ts (atualizar)
- **Resultado esperado:** Tela com secoes: Conta (nome, email — read-only, alterar senha), Aparencia (tema: Claro/Escuro/Sistema), Preferencias (unidade de altura: cm/pol, tamanho do time padrao: 6/7/etc, modo de montagem padrao: Competitivo/Desenvolvimento, tratar sobra padrao: Banco/Rodizio). Persistencia em localStorage (tema) e Supabase user_metadata ou tabela settings (preferencias). Botao "Exportar CSV".
- **Criterios de aceite:**
  - [ ] Tema persiste entre sessoes (Claro/Escuro/Sistema)
  - [ ] Preferencias salvas e restauradas
  - [ ] "Sistema" segue prefers-color-scheme
  - [ ] Alterar senha funcional

### Task 7.4 — Criar migration de settings + RLS
- **Tipo:** feat
- **Estimativa:** P
- **Prioridade:** media
- **Dependencias:** nenhuma
- **Arquivos esperados:** supabase/migrations/007_settings.sql
- **Resultado esperado:** Tabela `settings` (id, coach_id DEFAULT auth.uid() UNIQUE, unidade_altura text DEFAULT 'cm', tamanho_time_padrao int DEFAULT 6, modo_montagem_padrao text DEFAULT 'competitivo', tratar_sobra_padrao text DEFAULT 'banco', updated_at). RLS com coach_id = auth.uid(). Upsert policy.
- **Criterios de aceite:**
  - [ ] Tabela com RLS
  - [ ] UNIQUE em coach_id (um registro por coach)
  - [ ] Defaults sensiveis

### Task 7.5 — Implementar dark theme completo em todas as telas
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** media
- **Dependencias:** Task 7.3
- **Stories cobertas:** US-015
- **Arquivos esperados:** Modificar: src/styles/globals.css, src/contexts/theme-context.tsx, src/hooks/use-theme.ts (todos os componentes afetados)
- **Resultado esperado:** ThemeContext completo: Claro/Escuro/Sistema. Todas as CSS variables remapeadas para dark (surfaces navy, text claro, brand green mais brilhante, greens/reds saturados, borders sutis, sem sombras — elevacao por contraste). Componentes PlayerCard, ResultCard, BottomNav, sheets, forms todos com visual dark correto. Nunca #000 puro (RN10). Toggle acessivel em Settings.
- **Criterios de aceite:**
  - [ ] Todas as telas legiveis em dark theme
  - [ ] Sem #000 puro (navy suave)
  - [ ] Elevacao por contraste (nao por sombra) (RN10)
  - [ ] Brand colors ajustados para contraste
  - [ ] Toggle em Settings funciona e persiste

### Task 7.6 — Implementar exportar CSV
- **Tipo:** feat
- **Estimativa:** M
- **Prioridade:** media
- **Dependencias:** nenhuma
- **Stories cobertas:** US-014
- **Arquivos esperados:** src/lib/export-csv.ts (funcao utilitaria)
- **Resultado esperado:** Funcao que exporta dados de alunos (nome, turma, posicao, fundamentos, overall, V/D) como CSV. Acionada via botao em Settings. Download automatico no browser. Dados filtrados pelo coach logado (ja via RLS).
- **Criterios de aceite:**
  - [ ] CSV gerado com headers corretos
  - [ ] Dados de alunos incluidos
  - [ ] Download funciona no browser
  - [ ] Apenas dados do coach logado

### Task 7.7 — Polish: empty states, loading states e error states em todas as telas
- **Tipo:** feat
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** todas as sprints anteriores
- **Stories cobertas:** US-016
- **Arquivos esperados:** Modificar: todas as pages e componentes de lista
- **Resultado esperado:** Toda tela de lista tem empty state customizado com icone + mensagem + CTA (EmptyState component). Toda operacao async tem loading state (spinner ou skeleton). Toda operacao falivel tem error state com mensagem + retry via sonner toast. Telas: filiais vazia, turmas vazia, alunos vazios, historico vazio, avaliacoes vazia. Amostra insuficiente no perfil do aluno (RN11). Nenhuma tela fica em branco.
- **Criterios de aceite:**
  - [ ] Empty state em todas as listas vazias
  - [ ] Loading state em todas as operacoes async
  - [ ] Error state com toast em falhas
  - [ ] Amostra insuficiente no perfil (RN11)
  - [ ] Nenhuma tela em branco em nenhum estado

---

## Sprint 8 — Integracao Final + QA

**Objetivo da sprint:** Validacao end-to-end de todo o app: fluxo completo do treino (chamada → montar → resultado → historico → share → avaliacao), edge cases, performance do engine, acessibilidade, seguranca (pendencias restantes do Security Audit), e bug fixes.
**Pre-requisitos:** Sprint 7 concluida
**Definition of Done:** Fluxo completo funciona de ponta a ponta sem erros; edge cases cobertos; engine executa <500ms com 14 jogadores; contraste AA nos fluxos principais; todas as pendencias do Security Audit resolvidas; app funciona em 390px+ com touch targets >= 48px.

### Task 8.1 — Validar fluxo completo end-to-end
- **Tipo:** test
- **Estimativa:** G
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** (nenhum arquivo novo — validacao no browser)
- **Resultado esperado:** Testar o happy path completo: registro → login → criar filial → criar turma → cadastrar alunos → chamada → montar times → registrar resultado → historico → detalhe → share → avaliacao → perfil aluno. Cada passo deve funcionar sem erros de console, sem tela branca, sem dados perdidos.
- **Criterios de aceite:**
  - [ ] Happy path completo funciona sem erros
  - [ ] Dados persistem entre telas
  - [ ] Navegacao back funciona em todo lugar
  - [ ] Sem console.error no browser

### Task 8.2 — Testar edge cases do engine e fluxo de treino
- **Tipo:** test
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** (testes manuais + eventuais unit tests em src/engine/)
- **Resultado esperado:** Testar: 4 jogadores (minimo), 5 (impar), 7, 14, 30 (maximo). Sem levantadores. Todos com mesmo overall. Modo Desenvolvimento com 4 jogadores (sem variacao de nivel). Swap manual em todas as direcoes. Reequilibrar 10x sem crash. W.O. nos 4 formatos. Set empatado. "Salvar e registrar outra" 3x seguidas.
- **Criterios de aceite:**
  - [ ] Engine funciona com 4 a 30 jogadores
  - [ ] Jogadores impares vao pro banco
  - [ ] Sem crash em edge cases
  - [ ] Performance <500ms com 14 jogadores
  - [ ] W.O. funcional em todos os formatos

### Task 8.3 — Validar acessibilidade basica
- **Tipo:** test
- **Estimativa:** M
- **Prioridade:** media
- **Dependencias:** nenhuma
- **Arquivos esperados:** (nenhum arquivo novo — ajustes inline)
- **Resultado esperado:** Verificar: contraste minimo AA nos fluxos principais (especialmente em dark theme), focus ring visivel em todos os interativos, cores de estado acompanhadas de icone + texto (nunca cor-only), touch targets >= 48px em todos os botoes/toggles, labels em inputs (React Hook Form + aria-label). Corrigir problemas encontrados.
- **Criterios de aceite:**
  - [ ] Contraste AA nos fluxos principais
  - [ ] Focus ring visivel
  - [ ] Cores nunca sao unica indicacao de estado
  - [ ] Touch targets >= 48px
  - [ ] Labels/aria-labels em todos os inputs

### Task 8.4 — Resolver pendencias de seguranca restantes do Security Audit #2
- **Tipo:** fix
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** Modificar: migrations existentes ou nova migration, vite.config.ts, componentes afetados
- **Resultado esperado:** Validar e resolver todas as 8 pendencias do Security Audit #2 que nao foram cobertas inline nas sprints anteriores. Checklist: (SEC-C1) views usam SECURITY INVOKER — verificar se ha views e corrigir. (SEC-C2) indice em EXISTS path nas policies de cadeia — verificar performance. (SEC-A1) key imutavel em fundamentos_config — verificar trigger. (SEC-A2) CHECK de valor por escala — verificar constraint. (SEC-A3) TTL de signed URL — verificar configuracao. (SEC-M1) se aplicavel. (SEC-M2) se aplicavel. (SEC-B1) se aplicavel. Qualquer pendencia nao resolvida deve ser documentada com justificativa.
- **Criterios de aceite:**
  - [ ] SEC-C1: views com SECURITY INVOKER (se existem views)
  - [ ] SEC-C2: indice em EXISTS path verificado
  - [ ] SEC-A1: trigger de key imutavel funcional
  - [ ] SEC-A2: CHECK de valor por escala ativo
  - [ ] SEC-A3: signed URLs com TTL configurado
  - [ ] Todas as pendencias resolvidas ou documentadas

### Task 8.5 — Testar responsividade e mobile experience
- **Tipo:** test
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** nenhuma
- **Arquivos esperados:** (ajustes inline se necessario)
- **Resultado esperado:** Testar em 320px (minimo), 375px (iPhone SE), 390px (iPhone 14), 428px (iPhone 14 Pro Max). Verificar: nenhum overflow horizontal, textos legiveis, touch targets >= 48px, PlayerCard legivel, TeamPanels empilhados em mobile, BottomNav usavel com uma mao (thumb zone). Testar em iOS Safari e Chrome Android (ou emulacao). Corrigir problemas encontrados.
- **Criterios de aceite:**
  - [ ] Sem overflow horizontal em 320px+
  - [ ] Textos legiveis em todas as telas
  - [ ] PlayerCard e TeamPanels adaptam ao tamanho
  - [ ] BottomNav na thumb zone
  - [ ] Funcional em Safari e Chrome

### Task 8.6 — Configurar headers de seguranca para deploy
- **Tipo:** chore
- **Estimativa:** P
- **Prioridade:** media
- **Dependencias:** nenhuma
- **Arquivos esperados:** vercel.json ou _headers ou nginx.conf (conforme ambiente de deploy), docs/deploy-security-headers.md
- **Resultado esperado:** Configurar headers de seguranca conforme Security Review: Strict-Transport-Security, Content-Security-Policy (connect-src com dominio Supabase), X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin. Documentar configuracao para o ambiente de deploy escolhido.
- **Criterios de aceite:**
  - [ ] Headers configurados no arquivo de deploy
  - [ ] CSP com connect-src apontando pro Supabase
  - [ ] HSTS habilitado
  - [ ] Documentacao de deploy criada

### Task 8.7 — Bug fixes finais e ajustes de polish
- **Tipo:** fix
- **Estimativa:** M
- **Prioridade:** alta
- **Dependencias:** Task 8.1, Task 8.2, Task 8.3, Task 8.5
- **Resultado esperado:** Corrigir todos os bugs encontrados durante as tasks de teste (8.1-8.5). Ajustes de estilo, alinhamento, responsividade, textos. Garantir que o build final (`npm run build`) passa sem erros TypeScript nem warnings criticos.
- **Criterios de aceite:**
  - [ ] Todos os bugs reportados corrigidos
  - [ ] `npm run build` sem erros
  - [ ] App funcional de ponta a ponta
  - [ ] Pronto para deploy
