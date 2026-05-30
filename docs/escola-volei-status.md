# Status: escola-volei (Esporte Recreação)
## Fase atual: CONCLUÍDO — 8 sprints + revisão adversarial + correções ✅
## Último agente: Claude principal (ultracode)
## Branch: main

### Execução — 8/8 sprints
- Sprint 1 ✅ Setup + tokens Tailwind v4 + UI base + Supabase client + auth completo + layout + router. Schema (15 tabelas, RLS, 3 views, bucket privado) aplicado no remoto. Engine TS 10/10 testes.
- Sprint 2 ✅ Filiais + Turmas (CRUD, lock de exclusão RN06, filtro por filial).
- Sprint 3 ✅ Alunos (lista + perfil 2 abas + PlayerCard + PositionField + amostra insuficiente RN11).
- Sprint 4 ✅ Home + Chamada tri-state + engine buildTeams (Comp/Dev, swap manual, BalanceIndicator) + sessions/attendances.
- Sprint 5 ✅ Registrar resultado (formatos, WO, vencedor auto) + Histórico + Detalhe + ResultCard.
- Sprint 6 ✅ Avaliação por treino + Share (3 formatos, 3 temas, html-to-image).
- Sprint 7 ✅ Fundamentos config + Settings + dark theme + export CSV.
- Sprint 8 ✅ Code-splitting + headers de segurança + revisão adversarial + correções + build limpo.

### Revisão adversarial multi-agente (53 agentes, 4 dimensões) → 3 blockers corrigidos
- [BLOCKER] router.tsx revertido para Placeholders (páginas órfãs, fora do bundle) → RECONECTADO. Chunk index 86kB→184kB comprova. ERA o achado crítico (regressão de um batch cancelado por permissão).
- [BLOCKER] swapPlayer podia esvaziar um time → guard "mín. 1 jogador" + toast.
- [BLOCKER] W.O. salvava com winner null → exige seleção de vencedor.
- + warnings aplicados: seedCounter global→useRef, EmptyState p/ turma vazia na chamada, cap de 5 sets, touch targets ≥48px (Switch, PresenceToggle), batch delete .in() em syncTeams.
- design-fidelity: cores/PlayerCard/PresenceToggle/dark theme confirmados corretos pelos revisores.

### Validações ponta-a-ponta (REST com JWT real do coach)
- Isolamento RLS: coach logado vê seus dados; anon sem login vê 0 ✅
- Cadeia treino→presença→partida→sets→elencos respeitando RLS de cadeia ✅
- View V/D: Andre 1V / Bruno 1D ✅; avaliação → trigger sincroniza snapshot → overall sobe ✅
- Estado final: build 8 chunks (maior 210kB/54kB gzip), tsc 0 erros, engine 10/10, dev HTTP 200 ✅
- Dados: 2 filiais, 3 turmas, 14 alunos, 12 fundamentos, settings — coach treinador@gmail.com

### Pendências conhecidas (não-bloqueantes, v2)
- Upload de foto de aluno: fundação pronta (storage-service + signed URL TTL 30min + bucket privado RLS); falta UI de upload. Hoje todos usam avatar de iniciais.
- Validação Zod de skill_key contra skill_configs (hoje confiável pois vem do código); cache de getUser; persistência de rascunho da chamada.
- .env: secret-key veio igual à publishable (placeholder — trocar antes de produção).

### Correção pós-entrega (regressão pega pelo usuário)
- Home.tsx tinha ficado com placeholder da Sprint 1 ("será concluída na Sprint 4") — mesma regressão do batch cancelado por permissão que atingiu o router. Reescrito com a versão real (seleção de turma + iniciar treino).
- Auditoria profunda: 26/26 marcadores funcionais confirmados em todos os arquivos-chave. Home era o último órfão.
- **Smoke test de UI REAL** (Chrome headless via playwright-core, login real, viewport 390x844): login→Home mostra seleção de turma + turmas do banco; Alunos lista os 14; 0 erros de console. Screenshots em scripts/*.png (gitignored).

### Próximo passo
App completo, funcional e VALIDADO NO BROWSER. Para rodar: `npm run dev`. Login: treinador@gmail.com / teste123456.
Smoke UI: `node scripts/smoke-ui.mjs` (com dev server rodando). Pronto para deploy. Nada commitado ainda.
