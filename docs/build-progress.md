# Build Progress — Esporte Recreação (ultracode, sessão 2026-05-30)

## Estado: Sprint 1 ✅ concluída e validada. Sprints 2-8 pendentes.

### Ambiente
- Vite 6 + React 18 + TS strict + Tailwind v4 (@tailwindcss/vite) + shadcn-style UI custom
- Node 24, npm install OK. Build: `npm run build` → limpo (1719 módulos). Test: `npx vitest run`.
- Supabase remoto via Management API. Script: `node scripts/db-apply.mjs <arquivo.sql>` (lê .env).
- Coach teste: treinador@gmail.com / teste123456 / uid 990baf02-aaff-4d44-8c20-d7c93a44e8ca (ver docs/credentials.md)

### Schema aplicado no remoto (0001_initial_schema.sql)
15 tabelas, 3 views (security_invoker), 54 policies, 11 fns, 15 triggers, bucket privado student-photos + 4 storage policies.
Tabelas (nomes EM INGLÊS): profiles, settings, skill_configs, branches, teams, students, team_students,
student_skills, training_sessions, attendances, evaluations, evaluation_skills, matches, match_sets, match_rosters.
Enums via TEXT+CHECK. coach_id DEFAULT auth.uid() (NÃO usar subquery em DEFAULT). Policies usam (SELECT auth.uid()).
attendances.status: present|absent|late. matches.winner: a|b. matches.format: single|best_of_3|best_of_5|timed.
matches.walkover bool. match_rosters.side: a|b. teams.level: Iniciante|Intermediário|Avançado.
students.position: ''|LEV|PON|OPO|CEN|LIB. students tem guardian_name/guardian_phone/notes (SEC-M1 LGPD).
Trigger fn_sync_student_skill_from_eval: evaluation_skills → atualiza student_skills snapshot.
View v_student_overall: ROUND(48 + ((avg-1)/4.0)*50). v_student_match_stats: wins/losses. v_student_attendance_stats.

### Feito na Sprint 1 (arquivos já no disco)
- Config: package.json, vite.config.ts, tsconfig*.json, index.html (fonts Archivo+Barlow+Barlow Semi Condensed)
- src/styles/globals.css (tokens @theme + dark via [data-theme=dark] + classes .q-*), src/main.tsx
- src/lib/utils.ts (cn), constants.ts (POSITIONS, SKILL_ORDER/ABBR, MATCH_FORMATS, AVATAR_COLORS, MIN_MATCHES_FOR_STATS=5), format.ts (initials, avatarColor, overallFromSkills, formatHeight, formatDate)
- src/engine/ (build-teams, balance-score, tier-map, types, index) — pure TS, seed RNG. 10/10 testes (build-teams.test.ts).
- src/integrations/supabase/client.ts (usa VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY), types.ts (gerado), client-types.ts
- src/types/domain.ts (Branch, Team, Student, Match... + composites StudentWithStats, MatchWithDetail)
- src/components/ui/: button, input(+Textarea), label, field, select(nativo), badge, tabs(+Segmented), switch, sheet(portal), spinner(+FullPageSpinner)
- src/components/layouts/: AppLayout(+FocusLayout), Header, BottomNav (Início/Histórico/Alunos/Menu), EmptyState, NivelTag
- src/components/students/: Avatar, StatBadge, PlayerCard(PlayerCardData), Scale5, PositionField
- src/components/manage/: InfoRow, ListRow
- src/components/auth/: ProtectedRoute(+PublicOnlyRoute), AuthShell. ErrorBoundary.
- src/contexts/: auth-context (useAuth), theme-context (useTheme, light/dark/system)
- src/services/auth-service.ts (signIn/signUp/signOut/reset/updatePassword/getUser, mapAuthError genérico SEC)
- src/schemas/auth-schema.ts (login/register/forgot/reset)
- src/app/: providers (QueryClient+Theme+Auth+Toaster sonner), router (createBrowserRouter), App
- src/pages/: Login, Register, ForgotPassword, ResetPassword, Home(placeholder), Menu, NotFound, Placeholder

### Convenções
- Arquivos kebab-case OU PascalCase para componentes (seguir o que já existe na pasta). UI em pt-BR, código em inglês.
- Services = único acesso a supabase.from(). Hooks TanStack Query (use-*). invalidateQueries após mutations.
- Query keys: ['branches'], ['branches',id], ['classes',{branchId}], ['students',{teamId}].
- Toda página de lista: EmptyState + loading (FullPageSpinner) + erro (toast sonner).
- Botão primário: <Button> variant primary (verde). Sheet para confirmação destrutiva.

### Próximos passos (ordem)
- Sprint 2: branch-service/use-branches/branch-schema; class-service/use-classes/class-schema; pages/manage/Branches+BranchDetail+Classes+ClassDetail. Lock exclusão filial (trigger já existe → tratar erro 'turmas ativas'). Trocar Placeholders no router.
- Sprint 3: student-service/use-students/student-schema; pages/students/StudentList+StudentDetail (2 abas Dados+Desempenho). PlayerCard já existe.
- Sprint 4: Home real (seleção turma), PresenceToggle, Attendance, use-team-builder (usa src/engine), TeamPanel/BalanceIndicator/BuildOptions/Stepper, BuildTeams. session-service/attendance-service.
- Sprint 5: match-service/use-matches/match-schema; RegisterResult (formatos, WO, vencedor auto RN07), ResultCard/SetScoreRow, MatchHistory+MatchDetail.
- Sprint 6: evaluation-service/use-evaluations; EvaluatePlayer; ShareCard+SharePreview+use-share-image (html-to-image, 3 formatos 3 temas).
- Sprint 7: skills-config-service/use-skills-config; Skills page; Settings page (+ settings-service, persistência tema); export-csv; dark theme polish.
- Sprint 8: build final, edge cases, headers deploy (vercel.json/_headers), revisão.
- Validar cada sprint: `npm run build` deve passar. Atualizar router (tirar Placeholder). Ao fim: code-review adversarial do diff.
