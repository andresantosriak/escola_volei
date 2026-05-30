# PRD: Esporte Recreacao

**Status:** Planejamento
**Versao:** 1.0
**Data:** 2026-05-30
**Classificacao:** Projeto Novo

## TL;DR

App mobile-first para treinadores de volei recreativo gerenciarem turmas, fazerem chamada rapida, montarem times equilibrados com engine automatica e registrarem resultados de partidas -- tudo em poucos toques, na quadra, de pe, com uma mao so. Supabase como backend, Vite + React 18 + TypeScript.

---

## Problema

- Treinadores de volei recreativo gerenciam turmas, presenca, avaliacao de alunos e divisao de times usando papel, WhatsApp e planilhas.
- A divisao de times e feita "no olho", gerando desequilibrio recorrente e frustracao dos alunos.
- Nao ha registro historico de partidas, evolucao individual nem retrospecto de vitorias/derrotas.
- A comunicacao de resultados para alunos e pais depende de montagem manual de imagens ou mensagens.
- O treinador esta na quadra, de pe, ao sol, com uma mao -- ferramentas desktop ou formularios complexos sao inviaveis.

**Evidencia:** O briefing do cliente descreve exatamente esse cenario. O design system ja foi validado com prototipo de alta fidelidade cobrindo todos os fluxos.

---

## Personas e Jobs-to-be-Done

### Persona 1 -- Treinador (usuario principal)

- **Perfil:** Professor de educacao fisica ou treinador voluntario de volei recreativo. Gerencia ~14 alunos por turma, multiplas turmas, multiplas filiais. Usa o app na quadra, de pe, ao sol, com uma mao. Velocidade e legibilidade a distancia sao criticos.
- **Job:** Quando estou na quadra com meus alunos prontos pra jogar, quero fazer a chamada rapido, dividir times justos automaticamente e registrar o resultado -- em poucos toques e sem perder tempo -- para que eu possa focar no treino e manter um historico confiavel da evolucao de cada aluno.
- **Dores atuais:**
  - Divisao de times no olho -- injusta e demorada
  - Sem historico de partidas nem retrospecto individual
  - Avaliacao de fundamentos em papel -- perde-se, nao gera insight
  - Comunicar resultados exige montar imagens manualmente
  - Gerenciar multiplas turmas/filiais e confuso sem ferramenta centralizada
- **Ganhos esperados:**
  - Times equilibrados em segundos, com engine que considera todos os fundamentos
  - Player card gamificado que motiva alunos e impressiona pais
  - Historico completo de partidas com set-by-set e elencos
  - Imagem de resultado gerada em 2 toques para WhatsApp
  - Gestao centralizada de filiais, turmas e alunos

### Persona 2 -- Aluno (objeto passivo)

- **Perfil:** Jogador de 12 a 17 anos, nao interage diretamente com o app. E o "sujeito" dos dados -- seu desempenho e rastreado, seu player card e gerado, suas vitorias e derrotas sao registradas.
- **Job:** Como aluno, quero ver meu player card estilo FUT com minha nota geral e meus fundamentos para me sentir motivado a evoluir e poder mostrar pros amigos e pra familia.
- **Dores atuais:** Nao tem visibilidade da propria evolucao, divisao de times parece arbitraria.
- **Ganhos esperados:** Player card premium como objeto de orgulho, retrospecto de V/D, evolucao visivel.

---

## Controle de Acesso (RBAC)

**Abordagem escolhida:** A (roles fixos)

Na v1, ha um unico role: **treinador** (coach). O treinador e dono de todos os seus dados. Nao ha multi-usuario nem compartilhamento de turmas entre treinadores.

| Role | Descricao | Criado por |
|------|-----------|------------|
| coach | Acesso total aos proprios dados (filiais, turmas, alunos, partidas, avaliacoes) | Sistema (fixo) |

**Justificativa:** O produto e single-tenant por design (cada treinador ve so seus dados). RLS do Supabase isola dados por `coach_id = auth.uid()`. Nao ha necessidade de roles dinamicos nem de admin vs viewer.

**Futuro (fora do MVP):** Se houver demanda para "coordenador de escola" que veja dados de multiplos treinadores, promover para abordagem B ou C.

---

## Integracoes Externas

| Integracao | Proposito | Sandbox disponivel? | Custo/Limite | Notas |
|-----------|-----------|-------------------|--------------|-------|
| Supabase Auth | Autenticacao do treinador (email/senha) | Sim (projeto ja provisionado: alqagnftooeuzscomyku) | Free tier | Magic link como futuro nice-to-have |
| Supabase Storage | Fotos de alunos (avatares) | Sim | Free tier 1GB | Bucket privado com RLS |
| Supabase Realtime | Nao usado no MVP | -- | -- | Futuro: sync entre dispositivos |

**Webhooks recebidos:** Nenhum no MVP.
**Webhooks enviados:** Nenhum no MVP.

---

## Hipoteses

| # | Hipotese | Metrica de validacao | Risco |
|---|----------|---------------------|-------|
| H1 | Treinadores querem dividir times de forma automatica e equilibrada | >70% dos treinos usam "Montar times" ao inves de divisao manual | Baixo (problema validado no briefing) |
| H2 | O player card gamificado motiva alunos e engaja pais | Treinadores compartilham player cards via share >=1x/semana | Medio (depende de adocao) |
| H3 | Avaliacao rapida por treino (1-5 + ajustes) nao e pesada demais pro fluxo da quadra | >50% dos treinos tem avaliacoes preenchidas | Medio (pode ser abandonada se demorar demais) |
| H4 | A funcionalidade de compartilhar resultado como imagem substitui o workflow manual de WhatsApp | >60% das partidas sao compartilhadas via Share | Baixo |

---

## Validacao de Riscos (Cagan)

| Risco | Avaliacao | Mitigacao |
|-------|-----------|-----------|
| Valor | Baixo -- o problema e real e validado pelo cliente; o hero feature (montar times) resolve uma dor concreta | N/A |
| Usabilidade | Medio -- uso na quadra com uma mao, ao sol. Touch targets grandes e contraste alto sao criticos | Design system ja valida isso: min 48px touch target, card-based layout, font sizes generosos, cores de alto contraste |
| Viabilidade | Baixo -- stack conhecida (Vite + React + Supabase), engine de balanceamento ja prototipada em JS puro | Engine do data.js validada e portavel para producao |
| Negocio | Baixo -- sem regulacao, sem pagamento, dados nao sensíveis (nomes e notas de volei). LGPD: dados de menores requerem consentimento do responsavel | Incluir campo de contato do responsavel no cadastro do aluno; termos de uso basicos |

---

## Story Map (resumo)

```
[Onboarding]      --> [Gerenciar Estrutura]    --> [Treino Diario]               --> [Pos-Treino]
Signup/Login          Filiais, Turmas, Alunos      Chamada -> Montar Times          Registrar Resultado
                      Fundamentos Config           Swap manual, Reequilibrar        Avaliar Alunos
                                                                                    Historico + Detalhe
                                                                                    Compartilhar Imagem

MVP: Signup -> Criar Filial -> Criar Turma -> Cadastrar Alunos -> Chamada -> Montar Times -> Registrar Resultado -> Historico -> Share
v1.1: Graficos de evolucao, exportar CSV, backup
v2.0: Multi-treinador (RBAC B/C), Insights dashboard, notificacoes
```

---

## MVP -- O que entra

Tudo que esta no design system e MVP. O prototipo de alta fidelidade validou o escopo abaixo como v1 completa.

| # | Modulo / Feature | MoSCoW | Justificativa |
|---|-----------------|--------|---------------|
| 1 | **Auth** (signup + login email/senha) | Must | Sem auth nao ha usuario |
| 2 | **Filiais** (CRUD, arquivar, lock de exclusao) | Must | Estrutura base multi-filial |
| 3 | **Turmas** (CRUD, roster de alunos, filtro por filial) | Must | Sem turma nao ha chamada |
| 4 | **Alunos** (perfil 2 abas: Dados + Desempenho, PlayerCard) | Must | Sem aluno nao ha time |
| 5 | **Chamada / Presenca** (toggle tri-state: presente/falta/atraso) | Must | Entrada obrigatoria pro fluxo de treino |
| 6 | **Montar Times** (engine Competitivo + Desenvolvimento, swap manual, balance indicator) | Must | Hero feature -- razao de ser do app |
| 7 | **Registrar Resultado** (sets com +/-, formatos, vencedor auto/manual/W.O., "salvar e registrar outra") | Must | Sem resultado nao ha historico |
| 8 | **Historico** (lista de partidas, filtros) | Must | Visibilidade do retrospecto |
| 9 | **Detalhe da Partida** (set-by-set, elencos, equilibrio, forca, acoes: editar, excluir, compartilhar, ver avaliacoes) | Must | Completa a jornada do historico |
| 10 | **Compartilhar** (gerador de imagem: formatos quadrado/vertical/paisagem, temas Verde/Escuro/Claro, toggles elencos/sets/equilibrio) | Must | Validado como essencial para comunicacao com pais |
| 11 | **Compartilhar PlayerCard** (mesma engine de share, mas para o card do aluno) | Must | Compartilhar card do aluno via WhatsApp |
| 12 | **Avaliacoes por Treino** (lista de presentes, engajamento 1-5, ajustes de fundamento up/down, soft skills expandiveis, observacao) | Must | Alimenta o player card e o balance engine |
| 13 | **Fundamentos Config** (tecnicos + comportamentais, escala 1-3/1-5/1-10, pesos, on/off, drag pra reordenar, adicionar custom) | Must | Configurabilidade essencial -- cada treinador avalia coisas diferentes |
| 14 | **Configuracoes** (conta, tema claro/escuro/sistema persistido, unidade de altura cm/pol, tamanho do time padrao, modo de montagem padrao, tratar sobra, exportar CSV, backup) | Should | App funciona sem config customizada, mas e esperado pelo usuario |
| 15 | **Tema escuro** (full tokenized, toggle em Configuracoes) | Should | Uso ao ar livre com sol forte ou treino noturno |
| 16 | **Empty states** (todas as telas: nenhuma turma, nenhum aluno, nenhuma partida, amostra insuficiente) | Must | UX fundamental -- nunca tela em branco |
| 17 | **BottomNav** (Inicio, Historico, Alunos, Menu) | Must | Navegacao principal |

---

## Fora do MVP -- O que fica pra depois

| Feature | Motivo de exclusao | Quando revisar |
|---------|--------------------|----------------|
| Graficos de evolucao (trend chart no perfil do aluno) | Dados fake no prototipo; exige historico real acumulado | v1.1 (apos 30 dias de uso real) |
| Multi-treinador / compartilhar turmas | Requer RBAC B/C, complexidade alta | v2.0 |
| Insights dashboard (analytics por turma) | Segundo produto previsto no DS como fase 2 | v2.0 |
| Notificacoes push | Requer infra de push + permissoes nativas | v2.0 |
| Magic link / OAuth | Email+senha e suficiente pro MVP | v1.1 |
| App nativo (Capacitor) | Comecar como PWA, migrar se necessario | v1.1 |
| Foto real do aluno via camera | Avatares de iniciais funcionam; Storage config adicional | v1.1 |
| Relatorio PDF | Exportar CSV cobre a necessidade basica | v2.0 |

---

## Fluxo Principal (Happy Path)

1. **Signup/Login:** Treinador cria conta com email e senha.
2. **Criar filial:** Cadastra sua primeira unidade (nome, cidade, endereco opcional, telefone, responsavel).
3. **Criar turma:** Cria uma turma vinculada a filial (nome, dias, horario, nivel, faixa etaria, professor).
4. **Cadastrar alunos:** Adiciona alunos a turma (nome, nascimento, genero, altura, mao dominante, posicao principal + alternativas, contato/responsavel).
5. **Inicio:** Na home, seleciona a turma e toca "Iniciar treino".
6. **Chamada:** Marca presenca de cada aluno (presente / falta / atraso) via toggle tri-state. Contador mostra X/total confirmados.
7. **Montar times:** Toca "Montar times" (habilitado com >=4 presentes). Engine auto-divide presentes em 2 times equilibrados. Treinador pode:
   - Escolher modo (Competitivo / Desenvolvimento)
   - Escolher tamanho (6x6 / 7x7)
   - Escolher tratar sobra (Banco / Rodizio)
   - Renomear times
   - Tocar em jogador pra trocar de time (indice recalcula live)
   - Tocar "Reequilibrar" pra nova divisao
8. **Registrar resultado:** Toca "Registrar resultado". Informa placar set a set (formato: Set unico / Melhor de 3 / Melhor de 5 / Por tempo). Vencedor calculado automaticamente, com opcao de manual ou W.O. Pode "Salvar e registrar outra partida".
9. **Historico:** Partida aparece no historico. Toca pra abrir detalhe com set-by-set, elencos, equilibrio, forca.
10. **Compartilhar:** Do detalhe, toca "Compartilhar". Escolhe formato, tema, toggles. Gera imagem e salva/compartilha.
11. **Avaliar treino:** Do detalhe, toca "Ver avaliacoes desse treino". Avalia cada aluno presente: engajamento 1-5, ajustes de fundamento (up/down), soft skills (expandivel), observacao.
12. **Perfil do aluno:** A qualquer momento, acessa o perfil (Dados + Desempenho) com player card gamificado mostrando geral, fundamentos, V/D, posicao.

---

## Regras de Negocio

### RN01 -- Calculo do Geral (Overall Rating)

```
geral = Math.round(48 + (media_fundamentos - 1) / 4 * 50)
```

- `media_fundamentos` = media aritmetica dos 6 fundamentos tecnicos (saque, recepcao, levantamento, ataque, bloqueio, defesa), cada um de 1 a 5.
- Resultado: escala de ~48 a ~98 (nunca 0, nunca 100).
- Alimenta o PlayerCard, a lista de alunos, e o balance engine.

### RN02 -- Engine de Montar Times (buildTeams)

**Entrada:** Lista de presentes, opcoes {mode, size}.

**Processamento:**
1. **Selecionar jogadores:** Dos presentes, pega os `2 * size` com maior geral. O resto vai pro banco.
2. **600 iteracoes de busca:** Para cada iteracao:
   - Embaralha jogadores aleatoriamente.
   - Divide em 2 metades (Time A e Time B).
   - Executa um passo de busca local: para cada par (jogador do A, jogador do B), testa swap; se melhorar o objetivo, aceita.
   - Calcula objective score conforme o modo.
3. **Melhor resultado das 600 iteracoes vence.**

**Modos:**
- **Competitivo:** Objetivo = maximizar `balanceScore(t1, t2)`. Busca o jogo mais parelho possivel.
- **Desenvolvimento:** Objetivo = hard-prefer divisoes onde **cada time mistura niveis** (>=1 topo + >=1 base, definidos por tercos do geral via tierMap). Dentre as divisoes mistas, escolhe a mais equilibrada. Resultado esperado: indice pode ser mais baixo que Competitivo -- nao e defeito.

### RN03 -- Balance Score

```
balanceScore(t1, t2):
  fundDiff = soma dos |diferenca por fundamento|
  fundMax  = soma dos (total por fundamento)
  fundTerm = fundDiff / fundMax
  forceTerm = |forca(t1) - forca(t2)| / (forca(t1) + forca(t2))
  score = 100 - fundTerm * 130 - forceTerm * 90
  Penalidade: se um time nao tem levantador (principal), -22. Se tem levantador alternativo, +10.
  Clamped: 20..99
```

- `forca(team)` = soma dos gerais dos jogadores do time.
- Combina gap de forca total E gap por fundamento individual -- por isso um jogo "quase empatado" marca ~93%, nao 99%.

### RN04 -- TierMap (classificacao por nivel)

```
tierMap(presentes):
  Ordena por geral decrescente.
  cut = max(1, round(n / 3))
  Primeiros `cut` = 'topo'
  Ultimos `cut` = 'base'
  Restante = 'meio'
```

- Usado no modo Desenvolvimento pra garantir que cada time tem mentor (topo) + aprendiz (base).
- Exibido como badges no BalanceIndicator (Topo/Meio/Base por time).

### RN05 -- Constraint de Levantador

- `canLev(player)` = posicao principal e LEV, OU posicao alternativa inclui LEV.
- O engine tenta garantir **>=1 levantador (principal ou alternativo) por time**.
- Se nao ha levantadores suficientes, **aviso** e exibido (nao impede a montagem).
- Na posicao "LEV", a **tag** (LEV no card e nos panels) vem da posicao principal, nao do fundamento "Levantamento".

### RN06 -- Lock de Exclusao de Filial

- Filial com turmas ativas **nao pode ser excluida** -- botao desabilitado com explicacao "Mova ou arquive as turmas primeiro".
- Filial pode ser **arquivada** a qualquer momento.
- Filial sem turmas pode ser excluida com confirmacao (Sheet de confirmacao irreversivel).

### RN07 -- Formatos de Resultado

| Formato | Sets |
|---------|------|
| Set unico | 1 set |
| Melhor de 3 | Ate 3 sets |
| Melhor de 5 | Ate 5 sets |
| Por tempo | 1 set (placar ao final do tempo) |

- Sets adicionais podem ser adicionados/removidos manualmente.
- Vencedor: automatico (quem ganhou mais sets), manual (treinador escolhe), ou W.O. (vitoria sem placar completo).
- Se set empatado: aviso visual, treinador deve definir vencedor manualmente.
- "Salvar e registrar outra partida" permite registrar multiplas partidas no mesmo treino.

### RN08 -- Avaliacao por Treino

- **Fundamentos tecnicos:** Cada um mostra o nivel atual (1-5). Treinador so mexe no que mudou -- o que nao mexer nao gera ajuste.
- **Ajustes:** Cada alteracao gera um badge (up/down) visivel na lista de avaliacoes.
- **Engajamento:** Nota geral do dia (1-5), volatil, vira o "ENGAJ." no badge.
- **Soft skills:** Expandivel (Comportamento, Proatividade, Apoio ao time, Comunicacao, Esforco) -- nota individual 1-5.
- **Observacao:** Texto livre opcional.
- **Notas alimentam o balanceamento dos times** (fundamentos tecnicos) e o player card (geral, fundamentos).

### RN09 -- Fundamentos Configuraveis

| Tipo | Fundamentos padrao | Config |
|------|-------------------|--------|
| Tecnicos | Saque, Recepcao, Levantamento, Ataque, Bloqueio, Defesa, Posicionamento (off por padrao) | On/off, peso (x1.0-x1.4), drag pra reordenar, adicionar custom |
| Comportamentais | Comportamento, Proatividade, Apoio ao time, Comunicacao (off), Esforco | On/off, drag pra reordenar, adicionar custom |

- **Escala configuravel:** 1 a 3, 1 a 5 (padrao), ou 1 a 10.
- **Pesos:** Configuraveis em modo avancado (toggle "Mostrar pesos"). Exemplo: Ataque x1.4, Recepcao x1.2, Levantamento x1.3.
- **Pelo menos 1 fundamento deve permanecer ativo.**
- Mudancas na config afetam Avaliacao rapida e calculo de equilibrio dos times.

### RN10 -- Tema Escuro

- Totalmente tokenizado: toggle remapeia CSS custom properties (surfaces, text, borders, greens, reds, shadows).
- **Claro / Escuro / Sistema** (segue `prefers-color-scheme`).
- Persistido em `localStorage` (no app final, no storage do dispositivo/Supabase user_metadata).
- Dark: elevacao por contraste de surface (nao por sombra), greens/reds mais brilhantes, navy suave (nunca #000 puro).

### RN11 -- Amostra Insuficiente

- Se aluno tem <5 partidas (vitorias + derrotas < 5), a aba Desempenho mostra aviso: "Amostra insuficiente -- jogue mais treinos para liberar notas confiaveis."
- Nao exibe stats, grafico de evolucao nem partidas recentes nesse estado.
- Previne exibicao de dados estatisticamente insignificantes.

### RN12 -- Compartilhar (Share Engine)

- **Sujeitos:** Resultado de partida OU player card do aluno.
- **Formatos:** Quadrado (300x300), Vertical (300x533), Paisagem (340x191).
- **Temas:** Verde (gradiente brand), Escuro (navy gradient), Claro (white gradient).
- **Toggles (apenas para resultado):** Incluir elencos, Incluir placar set a set, Incluir indice de equilibrio.
- **Acoes:** Salvar na galeria, Compartilhar (share sheet nativa).
- **Loading state:** Overlay com spinner "Gerando imagem..." durante geracao.

---

## Metricas de Sucesso

| Metrica | Baseline | Meta | Prazo |
|---------|----------|------|-------|
| Treinadores cadastrados | 0 | 10 | 60 dias pos-lancamento |
| Treinos registrados por semana (por treinador ativo) | 0 | >=2 | 30 dias pos-lancamento |
| % treinos que usam "Montar times" | 0 | >70% | 30 dias |
| % partidas com resultado compartilhado via Share | 0 | >50% | 60 dias |
| % treinos com avaliacoes preenchidas | 0 | >40% | 60 dias |
| Retencao semanal (treinadores que usam >=1x/semana) | 0 | >60% | 60 dias |

---

## Criterios de Aceite do MVP

- [ ] Treinador consegue criar conta, fazer login e logout
- [ ] Treinador consegue criar, editar, arquivar e excluir filiais (com lock quando ha turmas ativas)
- [ ] Treinador consegue criar, editar, arquivar e excluir turmas vinculadas a filiais
- [ ] Treinador consegue cadastrar alunos com todos os campos (nome, nascimento, genero, altura, mao, posicao principal + alternativas, turma, contato/responsavel)
- [ ] Treinador consegue fazer chamada com toggle tri-state (presente/falta/atraso) para todos os alunos da turma
- [ ] Engine monta 2 times equilibrados automaticamente com >=4 presentes
- [ ] Modos Competitivo e Desenvolvimento funcionam conforme regras RN02-RN05
- [ ] Treinador consegue trocar jogador de time com toque e indice recalcula live
- [ ] Treinador consegue registrar resultado com placar set a set nos 4 formatos (Set unico, Melhor de 3, Melhor de 5, Por tempo)
- [ ] Vencedor auto, manual e W.O. funcionam corretamente
- [ ] Historico mostra todas as partidas com ResultCard
- [ ] Detalhe da partida mostra set-by-set, elencos, equilibrio na montagem, forca dos times
- [ ] Share gera imagem com 3 formatos, 3 temas, toggles funcionais (resultado e player card)
- [ ] Avaliacao por treino funciona: engajamento 1-5, ajustes de fundamento, soft skills, observacao
- [ ] Fundamentos configuraveis: on/off, peso, escala, reordenar, adicionar
- [ ] Configuracoes: tema (claro/escuro/sistema persistido), unidade altura, tamanho time, modo montagem, tratar sobra
- [ ] Exportar CSV funcional
- [ ] PlayerCard exibe geral, fundamentos, posicao, V/D, metadados
- [ ] Todos os empty states implementados conforme design system
- [ ] Tema escuro completo e funcional
- [ ] App funciona em mobile (390px+) com touch targets >=48px
- [ ] RLS ativa em todas as tabelas -- treinador so ve seus dados

---

## Requisitos Nao-Funcionais

- **Performance:** App carrega em <2s. Engine de balanceamento executa em <500ms com 14 jogadores. Lista de historico renderiza ate 100 partidas sem jank.
- **Acessibilidade:** Cores de estado sempre acompanhadas de icone + texto (nunca cor-only). Contraste minimo AA nos fluxos principais. Focus ring visivel em todos os interativos.
- **Seguranca:** RLS em todas as tabelas (isolamento por `coach_id`). Sem dados sensíveis expostos client-side. Supabase anon key apenas -- service_role nunca no client.
- **Responsividade:** Mobile-first (base 390px). Funcional em 320px+. Tablet: layout se adapta naturalmente (nao e prioridade de otimizacao).
- **Offline:** Fora do MVP. App requer conexao para funcionar.

---

## Suposicoes e Restricoes

### Suposicoes
- Treinador tem smartphone com acesso a internet na quadra.
- ~14 alunos por turma e o caso tipico (ate 30 seria suportado).
- Email + senha e suficiente para autenticacao na v1.
- O treinador e o unico usuario -- nao ha acesso do aluno ao app.

### Restricoes
- **Tech:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + Supabase (stack definida).
- **Backend:** Supabase ja provisionado (project_id = alqagnftooeuzscomyku).
- **LGPD:** Dados de menores requerem consentimento do responsavel. Campo de contato do responsavel e obrigatorio. Termos de uso basicos necessarios.
- **Fontes:** Archivo (display) + Barlow (body) via Google Fonts. Substituir se marca tiver fontes proprias.
- **Icones:** Lucide React. Substituir se marca tiver set proprio.

---

## Riscos e Mitigacao

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|--------------|---------|-----------|
| Avaliacao por treino ser pesada demais pro fluxo da quadra | Media | Alto | Avaliacao e opcional, nao bloqueia o fluxo. Soft skills sao colapsaveis. "Salvar e proximo" agiliza. |
| Geracao de imagem para share nao funcionar bem em todos os devices | Media | Medio | Usar html2canvas ou dom-to-image com fallback. Testar em iOS Safari e Chrome Android. |
| Engine de balanceamento nao ser boa o suficiente com poucos jogadores | Baixa | Medio | 600 iteracoes ja e robusto. Para <6 jogadores, divisao e trivial. |
| Treinador nao conseguir usar com uma mao so | Baixa | Alto | Design system ja valida isso com touch targets >=48px e acoes no thumb zone (dock inferior). |
| Performance com muitas partidas no historico | Baixa | Medio | Paginacao ou virtual scroll se >100 partidas. Indexar por turma_id + data no Supabase. |

---

## Stack Tecnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix + CVA) |
| Backend | Supabase (Auth, Database, Storage) |
| Data Fetching | TanStack React Query + Supabase client |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod |
| Charts | Recharts (evolucao do aluno -- v1.1) |
| Icons | lucide-react |
| Share Engine | html2canvas / dom-to-image (gerar imagem do ShareCard) |

---

## Historico de Versoes

| Versao | Data | Mudanca |
|--------|------|---------|
| 1.0 | 2026-05-30 | Versao inicial -- PRD completo extraido do design system |
