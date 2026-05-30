# ADR-002: Engine de Balanceamento de Times — Client-Side

## Status: Accepted

## Contexto

O recurso principal do app e o "Montar Times" — dado um conjunto de jogadores presentes no treino, dividir em dois times equilibrados. O algoritmo envolve:

- 600 iteracoes randomizadas com restarts
- Local-swap pass em cada iteracao (N x N comparacoes)
- Calculo de indice de equilibrio combinando forca total + gap por fundamento
- Dois modos: Competitivo (maximizar equilibrio) e Desenvolvimento (forcar mistura de niveis)
- Constraint de levantador (>=1 por time, principal ou alternativa)
- ~14 jogadores por turma (maximo realista)

A questao e: rodar no client ou no server?

## Decisao

**Engine roda inteiramente no client-side** como pure TypeScript functions em `src/engine/`.

O modulo `engine/` nao importa React, Supabase, nem nenhuma dependencia externa — e TypeScript puro, testavel unitariamente com qualquer test runner.

## Alternativas descartadas

- **Edge Function do Supabase:** Adicionaria latencia de rede (~200-500ms) para uma operacao que roda em <100ms no client. Complexidade de deploy desnecessaria. Os dados dos jogadores ja estao carregados no client (vieram do TanStack Query). Nao ha secrets envolvidos no calculo — sao apenas numeros.

- **Server-side com caching:** Over-engineering. O input muda a cada treino (jogadores presentes sao diferentes). Nao ha ganho de cache.

- **Web Worker:** Para 14 jogadores e 600 iteracoes, o calculo e rapido o suficiente para a main thread (<100ms). Web Workers adicionariam complexidade de comunicacao sem beneficio perceptivel. Reconsiderar se turmas passarem de 30 jogadores (improvavel pelo contexto do produto — volebol recreacional).

## Consequencias

**Positivas:**
- Resposta instantanea ao usuario (sem round-trip de rede)
- Testavel unitariamente sem browser — `buildTeams(players, opts)` e pure function
- Funciona offline (dados ja carregados)
- Sem custo de Edge Function
- Drag-to-swap e rebalance reagem em tempo real

**Negativas:**
- Se o algoritmo precisar de dados que nao estao no client (ex: historico de confrontos para balanceamento inteligente), seria necessario refatorar para incluir pre-fetch ou mover para server
- Codigo exposto no bundle — nao ha IP sensivel no algoritmo, entao nao e problema real
