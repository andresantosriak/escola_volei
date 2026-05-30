# Relatório de QA E2E — Esporte Recreação

**Data:** 2026-05-30
**Método:** Playwright dirigindo Google Chrome real (headless), viewport mobile 390×844, login real, interações reais (cliques, preenchimentos, navegação), captura de erros de console/rede e medição de tempos.
**Coach de teste:** `qa.bot@gmail.com` (isolado; dados criados e limpos pelo harness — nunca toca dados reais).
**Harness:** `scripts/qa/` (lib + 8 módulos + consolidador). Rodar: `node scripts/qa/<modulo>.mjs` com dev server de pé.

## Resultado consolidado

| Módulo | Pass | Warn | Fail |
|--------|------|------|------|
| 01 — Autenticação | 9 | 1¹ | 0 |
| 02 — Filiais + Turmas | 13 | 0 | 0 |
| 03 — Alunos | 8 | 0 | 0 |
| 04 — Fluxo de treino | 17 | 0 | 0 |
| 05 — Histórico + Compartilhar | 12 | 0 | 0 |
| 06 — Fundamentos + Configurações | 12 | 0 | 0 |
| 07 — CSV + Responsividade | 6 | 0 | 0 |
| 08 — Edge cases | 6 | 0 | 0 |
| **TOTAL** | **83** | **1** | **0** |

¹ Único warning: é **deliberado** — o teste de login com senha errada gera um HTTP 400 esperado (é justamente o caso validando que o erro amigável aparece). Não é defeito. Confirmado: login com senha correta retorna 200 em 3/3 execuções.

## 2 bugs reais encontrados e corrigidos durante o QA
1. **`Cannot update a component while rendering`** (React anti-pattern) em `EvaluatePlayer.tsx` e `RegisterResult.tsx` — faziam `navigate()` no corpo do render. Corrigido com `<Navigate>` declarativo. Pós-fix: módulo 04 = 17/17, console limpo.
2. **`Two children with the same key`** em `SharePreview.tsx` — roster usava o primeiro nome como `key`; jogadores homônimos colidiam. Corrigido com índice no key. Pós-fix: módulo 05 = 12/12, console limpo.

## Tempos de carregamento (após login, até conteúdo renderizado)
| Página | Tempo |
|--------|-------|
| Início | 293 ms |
| Filiais | 370 ms |
| Turmas | 68 ms |
| Alunos | 263 ms |
| Histórico | 369 ms |
| Fundamentos | 368 ms |
| Configurações | 81 ms |

Criação de registros (POST + refetch): filial/turma/aluno ~300–1000ms. Engine de montar times: <100ms (instantâneo na UI).

## Cobertura passo a passo

**Autenticação:** rota protegida redireciona p/ login; validação Zod (campos vazios); senha errada → erro genérico (SEC: não revela se e-mail existe); links criar conta / esqueci senha; login correto → Home; sessão persiste após reload; logout.

**Filiais:** listar; validação (nome obrigatório); criar (POST 201 confirmado na rede + toast); detalhe InfoRow; editar; **RN06: exclusão bloqueada com turma ativa** (mensagem clara).

**Turmas:** listar; criar vinculada à filial; detalhe com roster; filtro por filial.

**Alunos:** criar 6 (posição + idade + altura + turma); perfil 2 abas; player card GERAL; **RN11: amostra insuficiente**; ordenação nome↔nota.

**Fluxo de treino (core):** Home seleção de turma → "Iniciar treino"; Chamada tri-state com contador 7/7→6/7; engine monta times + índice de equilíbrio; Reequilibrar; alternar Competitivo/Desenvolvimento; Registrar resultado com steppers; **vencedor automático 25×20 → 1×0**; adicionar set; salvar → Avaliação (engajamento + fundamentos ± + soft) → concluir → Histórico.

**Histórico + Compartilhar:** lista de partidas; detalhe set-a-set + elencos + equilíbrio; gerador de imagem (3 formatos × 3 temas + toggles); compartilhar player card.

**Fundamentos + Config:** técnicos/comportamentais; "Mostrar pesos" → sliders; ativar/desativar; tema Escuro aplica `data-theme=dark` e **persiste após reload**; preferências persistem; exportar CSV (download real, cabeçalho correto, 26 linhas).

**Responsividade:** 320/375/390/428px — **sem overflow horizontal** em nenhum.

**Edge cases:** turma com 2 alunos → "Montar times" desabilitado + mensagem; set empatado bloqueia salvar; W.O. sem vencedor bloqueia salvar (fixes da revisão adversarial confirmados na UI real).

## Veredicto
**Aprovado.** 83/83 verificações reais passam, 0 falhas, 1 warning deliberado (teste de erro). 2 bugs reais foram pegos e corrigidos durante o QA. Build limpo, tsc 0 erros. Console 100% limpo em todos os fluxos exceto o caso de erro proposital.

### Observação de método
Várias asserções iniciais deram "fail" por timing (checavam o DOM antes do refetch do React Query). Foram corrigidas para usar o toast de sucesso como sinal confiável + confirmação na lista. Os "fails" eram do teste, não do app — confirmado por captura de rede (POST 201). Nenhum bug do app passou despercebido por causa disso, pois cada caso foi verificado na rede e por screenshot.
