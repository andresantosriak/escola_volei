# Security Audit: Esporte Recreacao -- pos-Data Architect

**Projeto:** Esporte Recreacao
**Modo:** Security Review pos-Data Architect (Modo 1 -- Review do Schema)
**Data:** 2026-05-30
**Referencia:** docs/escola-volei-security-review.md (requisitos), docs/escola-volei-data-architecture.md (implementacao)

---

## 1. RLS Review -- Tabela por Tabela

### Veredicto: APROVADO

Todas as 14 tabelas tem RLS habilitado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) na mesma definicao que cria a tabela. Policies separadas por operacao (SELECT/INSERT/UPDATE/DELETE). Nenhuma policy aditiva no mesmo role.

| Tabela | RLS | SELECT | INSERT | UPDATE | DELETE | Status |
|--------|-----|--------|--------|--------|--------|--------|
| profiles | Sim | `id = (SELECT auth.uid())` | `id = (SELECT auth.uid())` | `id = (SELECT auth.uid())` | -- | APROVADO |
| branches | Sim | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` + trigger | APROVADO |
| teams | Sim | `coach_id = (SELECT auth.uid())` | coach_id + branch owner validation | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | APROVADO |
| students | Sim | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | APROVADO |
| team_students | Sim | via teams.coach_id | team + student ownership | -- | via teams.coach_id | APROVADO |
| skill_configs | Sim | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | -- | APROVADO |
| training_sessions | Sim | `coach_id = (SELECT auth.uid())` | coach_id + fn_is_coach_owner_of_team | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | APROVADO |
| attendances | Sim | fn_is_coach_owner_of_session | fn_is_coach_owner_of_session | fn_is_coach_owner_of_session | fn_is_coach_owner_of_session | APROVADO |
| evaluations | Sim | fn_is_coach_owner_of_session | fn_is_coach_owner_of_session | fn_is_coach_owner_of_session | fn_is_coach_owner_of_session | APROVADO |
| evaluation_skills | Sim | fn_is_coach_owner_of_evaluation | fn_is_coach_owner_of_evaluation | fn_is_coach_owner_of_evaluation | fn_is_coach_owner_of_evaluation | APROVADO |
| matches | Sim | `coach_id = (SELECT auth.uid())` | coach_id + fn_is_coach_owner_of_team | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | APROVADO |
| match_sets | Sim | fn_is_coach_owner_of_match | fn_is_coach_owner_of_match | fn_is_coach_owner_of_match | fn_is_coach_owner_of_match | APROVADO |
| match_rosters | Sim | fn_is_coach_owner_of_match | fn_is_coach_owner_of_match | -- | fn_is_coach_owner_of_match | APROVADO |
| student_skills | Sim | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | `coach_id = (SELECT auth.uid())` | -- | APROVADO |
| settings | Sim | `coach_id = (SELECT auth.uid())` | -- (via trigger) | `coach_id = (SELECT auth.uid())` | -- | APROVADO |

**Padroes cross-project validados aplicados corretamente:**
- Wrapper `(SELECT auth.uid())` em TODAS as policies -- CONFIRMADO
- Policies separadas por operacao, sem OR aditivo -- CONFIRMADO
- `coach_id` denormalizado em tabelas de primeiro nivel (evita JOINs em policies SELECT) -- CONFIRMADO
- `DEFAULT (SELECT auth.uid())` em colunas `coach_id` (nunca vem do client) -- CONFIRMADO

---

## 2. Anti-Patterns RLS

### Veredicto: APROVADO

| Anti-pattern | Verificacao | Resultado |
|-------------|-------------|-----------|
| Policies SELECT aditivas no mesmo role (OR que vaza dados) | Verificado em todas as 14 tabelas | Nenhuma encontrada. Uma policy por operacao por tabela |
| UPDATE permissivo sem granularidade column-level | Verificado UPDATE policies | Nenhum UPDATE sem WITH CHECK. Todas tem USING + WITH CHECK |
| SECURITY DEFINER sem SET search_path | Verificado em todas as 5 funcoes SD | TODAS tem `SET search_path = public` |
| DELETE sem restricao (cascata nao controlada) | Verificado policies DELETE | Todas validam ownership. `fn_prevent_branch_delete_with_active_teams` protege exclusao de filiais |

**Funcoes SECURITY DEFINER auditadas:**

| Funcao | SET search_path | Proposito | Status |
|--------|----------------|-----------|--------|
| fn_is_coach_owner_of_team | `= public` | Helper RLS para ownership de turma | APROVADO |
| fn_is_coach_owner_of_session | `= public` | Helper RLS para ownership de sessao | APROVADO |
| fn_is_coach_owner_of_match | `= public` | Helper RLS para ownership de partida | APROVADO |
| fn_is_coach_owner_of_evaluation | `= public` | Helper RLS para ownership de avaliacao | APROVADO |
| fn_handle_new_user | `= public` | Criar profile no signup | APROVADO |
| fn_initialize_coach_settings | `= public` | Criar settings default | APROVADO |
| fn_initialize_default_skill_configs | `= public` | Criar skill_configs default | APROVADO |

**Nota positiva:** O uso de helper functions SECURITY DEFINER para tabelas-filhas (attendances, evaluations, etc.) e o padrao correto -- evita depender de policies intermediarias que poderiam bloquear recursivamente. A decisao arquitetural (ADR-003) esta alinhada com os requisitos do Security Review #1.

---

## 3. Indices para Policies RLS

### Veredicto: APROVADO

Toda coluna usada em WHERE de policies ou helper functions tem indice correspondente.

| Coluna | Tabela(s) | Usada em | Indice | Status |
|--------|-----------|----------|--------|--------|
| coach_id | branches, teams, students, training_sessions, matches, student_skills, skill_configs | Policies SELECT/INSERT/UPDATE/DELETE | idx_{tabela}_coach_id | APROVADO |
| branch_id | teams | JOIN em fn_is_coach_owner_of_team | idx_teams_branch_id | APROVADO |
| team_id | team_students, training_sessions, matches | Policies + helper functions | idx_{tabela}_team_id | APROVADO |
| session_id | attendances, evaluations | fn_is_coach_owner_of_session | idx_{tabela}_session_id | APROVADO |
| student_id | team_students, attendances, evaluations, match_rosters, student_skills | JOINs | idx_{tabela}_student_id | APROVADO |
| evaluation_id | evaluation_skills | fn_is_coach_owner_of_evaluation | idx_evaluation_skills_evaluation_id | APROVADO |
| match_id | match_sets, match_rosters | fn_is_coach_owner_of_match | idx_{tabela}_match_id | APROVADO |
| coach_id (settings) | settings | Policy SELECT/UPDATE | UNIQUE constraint gera indice implicito | APROVADO |

---

## 4. Protecao de Dados de Menores (PII)

### Veredicto: APROVADO com 1 pendencia media

**Dados protegidos:**

| Dado | Tabela | Classificacao | Protecao | Status |
|------|--------|--------------|----------|--------|
| Nome do aluno | students | Interno | RLS por coach_id | APROVADO |
| Idade | students | Interno | RLS por coach_id, CHECK (1-99) | APROVADO |
| Altura | students | Interno | RLS por coach_id, CHECK (50-250) | APROVADO |
| Mao dominante | students | Interno | RLS por coach_id | APROVADO |
| Posicao | students | Interno | RLS por coach_id, CHECK enum | APROVADO |
| Foto (path) | students.photo_path | Confidencial | RLS + bucket privado + signed URLs | APROVADO |
| Consentimento parental | students.parental_consent | Interno | RLS por coach_id | APROVADO |
| Notas/fundamentos | student_skills, evaluation_skills | Interno | RLS por coach_id ou via helper functions | APROVADO |
| V/D | match_rosters + matches | Interno | RLS por coach_id ou via helper functions | APROVADO |

**Pendencia:**

- **[MEDIA] Campo de contato do responsavel ausente na tabela `students`:** O PRD (secao "Suposicoes e Restricoes") e o fluxo de cadastro mencionam "contato/responsavel" como campo obrigatorio do aluno. A tabela `students` nao possui campos `guardian_name`, `guardian_phone` ou `guardian_email`. Isso nao e uma vulnerabilidade de seguranca direta, mas e um requisito de compliance LGPD (Art. 14) para dados de menores -- o responsavel legal deve ser identificavel. **Recomendacao:** Adicionar `guardian_name TEXT NOT NULL DEFAULT ''` e `guardian_phone TEXT NOT NULL DEFAULT ''` a tabela `students`.

---

## 5. Trigger de Lock de Exclusao de Filial

### Veredicto: APROVADO

A funcao `fn_prevent_branch_delete_with_active_teams`:
- E um trigger BEFORE DELETE (momento correto -- previne a exclusao antes de acontecer)
- Verifica `EXISTS (SELECT 1 FROM teams WHERE branch_id = OLD.id AND archived = false)`
- Usa `RAISE EXCEPTION` para bloquear com mensagem clara
- **NAO pode ser bypassed** pelo client: o trigger roda no nivel do banco, independente de quem chama o DELETE. Mesmo via Supabase client ou SQL direto, o trigger impede a exclusao.
- **NAO e SECURITY DEFINER** (corretamente -- nao precisa ser, pois roda no contexto do DELETE que ja foi autorizado pela policy RLS)

**Cenario de bypass verificado:** Um coach malicioso poderia tentar:
1. Arquivar todas as turmas (`UPDATE teams SET archived = true`) e depois deletar a filial -- isso e comportamento ESPERADO e correto, pois as turmas foram arquivadas pelo proprio coach.
2. DELETE direto via API -- bloqueado pela policy RLS (so deleta suas proprias filiais) E pelo trigger (verifica turmas ativas).

---

## 6. Storage -- Bucket de Fotos

### Veredicto: APROVADO

| Item | Requisito (Review #1) | Implementacao | Status |
|------|----------------------|---------------|--------|
| Bucket privado | `aluno-fotos` privado | Configurado como privado | APROVADO |
| Signed URLs com TTL max 1h | max 3600s | `createSignedUrl(..., 3600)` | APROVADO |
| MIME types | image/jpeg, image/png, image/webp | Documentado na config do bucket | APROVADO |
| Tamanho max | 5MB | Documentado na config do bucket | APROVADO |
| Path isolado por coach | `{coach_uid}/{student_id}/` | `(storage.foldername(name))[1] = (SELECT auth.uid())::text` | APROVADO |
| RLS no storage | Policies SELECT/INSERT/UPDATE/DELETE | 4 policies com verificacao de coach via foldername | APROVADO |
| Nunca URL publica | Signed URLs only | Bucket privado, nao ha policy publica | APROVADO |

**Analise das policies de storage:**
- `foldername(name)[1]` extrai o primeiro segmento do path (que e o `coach_uid`) -- garante isolamento por coach
- Usa `(SELECT auth.uid())::text` -- wrapper correto
- 4 policies cobrem todas as operacoes (SELECT, INSERT, UPDATE, DELETE)

---

## 7. Views e Data Exposure

### Veredicto: APROVADO

| View | Expoe dados cross-coach? | Mecanismo de protecao | Status |
|------|--------------------------|----------------------|--------|
| v_student_overall | Nao | Herda RLS da tabela `students` (filtro por coach_id) | APROVADO |
| v_student_match_stats | Nao | JOIN com `students` que tem RLS por coach_id | APROVADO |
| v_student_attendance_stats | Nao | JOIN com `students` que tem RLS por coach_id | APROVADO |

**Nota tecnica:** No Supabase/Postgres, views sem `SECURITY DEFINER` herdam as policies RLS das tabelas base referenciadas. Como todas as views fazem JOIN com `students` (que tem RLS por `coach_id`), os dados retornados sao automaticamente filtrados para o coach autenticado. Isso e correto e seguro.

---

## 8. Requisitos do Security Review #1 vs Implementacao

| Requisito (secao 3.2 do Review #1) | Implementado | Observacao |
|-------------------------------------|-------------|------------|
| RLS em TODAS as tabelas | SIM | 14/14 tabelas com RLS habilitado |
| Wrapper `(SELECT auth.uid())` em todas as policies | SIM | Todas as 40+ policies usam o wrapper |
| Helper SECURITY DEFINER para operacoes complexas | SIM | 4 helpers para cadeia de ownership |
| Indices em colunas referenciadas por policies | SIM | 20+ indices criados |
| Policies atomicas com criacao da tabela | SIM | Ordem de migrations respeita dependencias |
| coach_id nunca vem do client | SIM | `DEFAULT (SELECT auth.uid())` + `WITH CHECK` |
| Bucket privado aluno-fotos com RLS | SIM | 4 policies de storage |
| Trigger de lock de exclusao de filial | SIM | `fn_prevent_branch_delete_with_active_teams` |
| Cadeia de ownership (coach > filial > turma > aluno) | SIM | Implementada via denormalizacao + helpers |

| Requisito (secao 3.1 -- Auth) | Implementado no Data Arch? | Observacao |
|-------------------------------|---------------------------|------------|
| Auth via Supabase Auth | N/A (config, nao schema) | Coberto pela Architecture |
| Trigger de profile ao signup | SIM | `fn_handle_new_user` em auth.users |
| Settings default ao signup | SIM | Trigger `fn_initialize_coach_settings` |
| Skill configs default ao signup | SIM | Trigger `fn_initialize_default_skill_configs` |

| Requisito (secao 3.4 -- Input Validation) | Implementado no Data Arch? | Observacao |
|------------------------------------------|---------------------------|------------|
| Range validation em campos numericos | SIM (parcial) | CHECK constraints: age (1-99), height_cm (50-250), engagement (1-5), skill value (1-5), balance_score (0-100), set_number (>=1), points (>=0) |
| Enum validation | SIM | CHECK em: position, dominant_hand, level, status (attendance), direction (eval_skills), theme, height_unit, team_size, assembly_mode, bench_policy, winner, side |

---

## 9. Pendencias e Recomendacoes

### Pendencias por Severidade

**Criticas:** Nenhuma

**Altas:** Nenhuma

**Medias:**

1. **[MEDIA] Campo de contato do responsavel ausente na tabela `students`**
   - **Risco:** Compliance LGPD (Art. 14) -- dados de menores requerem identificacao do responsavel legal
   - **Requisito de origem:** PRD secao "Fluxo Principal" item 4 e secao "Restricoes" LGPD
   - **Correcao:** Adicionar `guardian_name TEXT NOT NULL DEFAULT ''` e `guardian_phone TEXT NOT NULL DEFAULT ''` a tabela `students`
   - **Responsavel:** Stack Agent ou Data Architect (migration adicional)

2. **[MEDIA] Tabela `evaluation_skills` -- escala fixa 1-5 vs escala configuravel**
   - **Risco:** Inconsistencia de dados. O PRD define que fundamentos tem escala configuravel (1-3, 1-5, 1-10), mas o CHECK constraint em `evaluation_skills.value` e fixo: `CHECK (value >= 1 AND value <= 5)`. Se um coach configurar escala 1-10, o banco rejeitara valores 6-10.
   - **Mesma situacao em `student_skills.value`**: CHECK fixo `>= 1 AND <= 5`
   - **Correcao:** Ampliar CHECK para `CHECK (value >= 1 AND value <= 10)` em `evaluation_skills.value` e `student_skills.value`, ou remover o CHECK e validar no application layer com base na config do coach
   - **Responsavel:** Stack Agent (migration)

**Baixas:**

3. **[BAIXA] Tabela `team_students` sem policy UPDATE**
   - **Risco:** Baixo -- a relacao pivot M:N normalmente nao precisa de UPDATE (deleta e recria). Mas se no futuro for necessario atualizar a relacao sem deletar, nao havera policy.
   - **Correcao:** Nenhuma acao necessaria no MVP. Documentar como decisao consciente.

4. **[BAIXA] Tabela `match_rosters` sem policy UPDATE**
   - **Risco:** Baixo -- mesma justificativa de team_students. Rosters sao inseridos no registro de partida e nao alterados depois.
   - **Correcao:** Nenhuma acao necessaria no MVP.

5. **[BAIXA] Tabela `student_skills` e `skill_configs` sem policy DELETE**
   - **Risco:** Baixo -- skills nao sao deletadas, apenas desativadas (`active = false` em skill_configs). Student skills persistem. Sem DELETE policy, o client nao consegue deletar via Supabase client (RLS bloqueia por padrao quando nao ha policy).
   - **Correcao:** Nenhuma acao necessaria. Comportamento correto por design -- ausencia de policy = bloqueio implicito.

---

## 10. Resumo de Veredictos

| Area | Veredicto |
|------|-----------|
| RLS (todas as tabelas) | APROVADO |
| Anti-patterns RLS | APROVADO |
| Indices para policies | APROVADO |
| Dados de menores (PII) | APROVADO com 1 pendencia media |
| Trigger de lock de filial | APROVADO |
| Storage (bucket fotos) | APROVADO |
| Views (data exposure) | APROVADO |
| Requisitos do Review #1 | APROVADO |
| Consistencia schema vs PRD | 2 pendencias medias |

---

## Veredicto Final

**APROVADO** -- O modelo de dados e as RLS policies atendem os requisitos de seguranca definidos no Security Review #1. O Data Architect aplicou corretamente todos os padroes cross-project (wrapper `(SELECT auth.uid())`, SECURITY DEFINER com `SET search_path`, indices em colunas de policies, policies separadas por operacao, denormalizacao de `coach_id` para performance de RLS).

**Nenhuma pendencia critica ou alta.** As 2 pendencias medias (campo de contato do responsavel e escala fixa vs configuravel) e as 3 pendencias baixas devem ser enderecadas pelo Backlog/Stack Agent mas NAO bloqueiam o avanço do planejamento.

Qualidade do trabalho do Data Architect: **excelente** -- schema bem estruturado, decisoes documentadas, alinhamento com requisitos de seguranca.
