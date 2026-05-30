# User Stories: Esporte Recreacao

**Versao:** 1.0
**Data:** 2026-05-30

---

## Epico 1: Autenticacao

**Outcome do epico:** Treinador consegue acessar o app com seguranca e ter seus dados isolados.
**Metricas:** 100% dos usuarios autenticados com RLS ativo.

---

### US-001: Criar conta de treinador

**Como** treinador
**Quero** criar uma conta com meu email e senha
**Para** ter acesso ao app e comecar a gerenciar minhas turmas

**Contexto:** Primeiro acesso ao app. Tela de signup.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou na tela de signup, quando preencho email valido e senha (min 6 chars) e toco "Criar conta", entao minha conta e criada e sou redirecionado para a Home
- [ ] Dado que criei a conta, quando acesso qualquer tela, entao meus dados estao isolados por RLS (nao vejo dados de outros treinadores)

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que informo um email ja cadastrado, quando tento criar conta, entao vejo mensagem "Este email ja esta cadastrado. Faca login."
- [ ] Dado que informo email invalido ou senha com <6 chars, quando tento criar conta, entao vejo validacao inline nos campos
- [ ] Estado vazio: tela de signup limpa com campos email e senha, botao "Criar conta", link "Ja tem conta? Entrar"
- [ ] Estado de loading: botao mostra spinner enquanto cria conta
- [ ] Estado de erro: se Supabase retornar erro generico, exibir "Erro ao criar conta. Tente novamente." com botao retry

**Fora do escopo desta story:**
- Magic link, OAuth, verificacao de email

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** Nenhuma

---

### US-002: Login de treinador

**Como** treinador
**Quero** fazer login com meu email e senha
**Para** acessar meus dados salvos

**Contexto:** Retorno ao app apos ter criado conta.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou na tela de login, quando informo email e senha corretos e toco "Entrar", entao sou redirecionado para a Home
- [ ] Dado que estou logado, quando fecho e reabro o app, entao minha sessao e mantida (nao precisa logar de novo)

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que informo credenciais invalidas, quando tento logar, entao vejo "Email ou senha incorretos"
- [ ] Estado de loading: botao mostra spinner enquanto autentica
- [ ] Estado de erro: erro de rede exibe "Sem conexao. Verifique sua internet."

**Fora do escopo desta story:**
- Recuperacao de senha (pode ser adicionada como story separada se necessario)

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-001

---

### US-003: Logout

**Como** treinador
**Quero** sair da minha conta
**Para** proteger meus dados em dispositivo compartilhado

**Contexto:** Menu > Configuracoes > Sair.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou logado e toco "Sair" em Configuracoes, entao minha sessao e encerrada e sou redirecionado para a tela de login

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que o logout falhe, entao exibir "Erro ao sair. Tente novamente."

**Fora do escopo desta story:**
- Confirmacao antes de sair (nao ha no design system)

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-002

---

## Epico 2: Filiais

**Outcome do epico:** Treinador consegue organizar sua estrutura em multiplas unidades.
**Metricas:** Treinadores criam >=1 filial na primeira sessao.

---

### US-004: Listar filiais

**Como** treinador
**Quero** ver todas as minhas filiais
**Para** acessar a gestao de cada unidade

**Contexto:** Menu > Filiais.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que tenho filiais cadastradas, quando acesso a tela de Filiais, entao vejo lista com nome, cidade, quantidade de turmas e alunos de cada filial
- [ ] Dado que toco em uma filial, entao sou levado ao detalhe dessa filial

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Estado vazio: "Nenhuma filial cadastrada. Crie sua primeira unidade para comecar." + CTA "Criar filial"
- [ ] Estado de loading: skeleton cards enquanto carrega
- [ ] Estado de erro: "Erro ao carregar filiais. Tente novamente." + retry

**Fora do escopo desta story:**
- Filtros ou busca de filiais

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-001

---

### US-005: Criar filial

**Como** treinador
**Quero** cadastrar uma nova filial
**Para** organizar minhas turmas por unidade

**Contexto:** Tela Filiais > botao "+". Abre FilialDetailScreen em modo "Nova filial".

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou na tela "Nova filial", quando preencho nome (obrigatorio), cidade (obrigatorio), endereco (opcional), telefone (opcional), responsavel (opcional) e toco "Salvar", entao a filial e criada e volto pra lista com toast "Filial criada"
- [ ] Dado que a filial foi criada, quando acesso a lista, entao ela aparece com 0 turmas e 0 alunos

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que nome ou cidade estao vazios, quando tento salvar, entao vejo validacao inline "Campo obrigatorio"
- [ ] Estado de loading: botao "Salvar" mostra spinner
- [ ] Estado de erro: "Erro ao criar filial. Tente novamente."

**Fora do escopo desta story:**
- Geolocalizacao automatica

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-004

---

### US-006: Editar filial

**Como** treinador
**Quero** editar os dados de uma filial existente
**Para** manter as informacoes atualizadas

**Contexto:** Detalhe da filial > "Editar" > campos editaveis > "Salvar".

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou no detalhe da filial em modo visualizacao (InfoRow), quando toco "Editar", entao os campos se tornam editaveis
- [ ] Dado que alterei campos e toco "Salvar", entao as alteracoes sao persistidas e volto pro modo visualizacao com toast "Filial salva"

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que esvazio o campo nome, quando tento salvar, entao vejo validacao "Campo obrigatorio"

**Fora do escopo desta story:**
- Historico de alteracoes

**Prioridade:** Media
**Tamanho:** P (<=1d)
**Dependencias:** US-005

---

### US-007: Arquivar e excluir filial

**Como** treinador
**Quero** arquivar ou excluir uma filial que nao uso mais
**Para** manter minha lista organizada

**Contexto:** Detalhe da filial > Acoes.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que a filial **nao tem turmas ativas**, quando toco "Excluir filial", entao vejo Sheet de confirmacao ("Esta acao nao pode ser desfeita"). Ao confirmar, filial e removida e volto pra lista.
- [ ] Dado que toco "Arquivar filial", entao a filial e arquivada com toast "Filial arquivada"

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que a filial **tem turmas ativas**, quando tento excluir, entao o botao esta desabilitado com explicacao: "Filiais com turmas ativas nao podem ser excluidas -- arquive ou mova as turmas antes." + icone de cadeado (lock)
- [ ] Dado que a filial tem turmas ativas, quando toco o botao de excluir, entao toast exibe "Mova ou arquive as turmas primeiro"

**Fora do escopo desta story:**
- Desarquivar filial

**Prioridade:** Media
**Tamanho:** P (<=1d)
**Dependencias:** US-005

---

## Epico 3: Turmas

**Outcome do epico:** Treinador consegue criar e gerenciar turmas vinculadas a filiais.
**Metricas:** >=1 turma criada por treinador ativo.

---

### US-008: Listar turmas

**Como** treinador
**Quero** ver todas as minhas turmas com filtro por filial
**Para** encontrar rapidamente a turma que preciso

**Contexto:** Menu > Turmas.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que tenho turmas cadastradas, quando acesso a tela Turmas, entao vejo lista com nome, filial, dias, horario, nivel (tag colorida), quantidade de alunos
- [ ] Dado que toco em um chip de filtro (ex: "Unidade Centro"), entao a lista filtra so as turmas daquela filial
- [ ] Dado que toco "Todas", entao vejo todas as turmas

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Estado vazio: tela sem turmas, orientacao pra criar
- [ ] Estado de loading: skeleton
- [ ] Estado de erro: mensagem + retry

**Fora do escopo desta story:**
- Busca por nome de turma

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-005

---

### US-009: Criar turma

**Como** treinador
**Quero** cadastrar uma nova turma vinculada a uma filial
**Para** organizar meus alunos por grupo de treino

**Contexto:** Tela Turmas > "+" ou Detalhe da Filial > "Nova turma". Abre TurmaDetailScreen em modo "Nova turma" (pre-selecionando a filial se veio do detalhe).

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou na tela "Nova turma", quando preencho nome (obrigatorio), filial (obrigatorio, select), dias, horario, nivel (Iniciante/Intermediario/Avancado), faixa etaria, professor responsavel e toco "Salvar", entao a turma e criada com toast "Turma criada"
- [ ] Dado que vim do detalhe de uma filial, quando a tela de nova turma abre, entao o campo "Filial" ja esta pre-selecionado

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que nome ou filial estao vazios, quando tento salvar, entao vejo validacao inline
- [ ] Estado de loading: spinner no botao
- [ ] Estado de erro: toast de erro

**Fora do escopo desta story:**
- Importar alunos em lote na criacao

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-008

---

### US-010: Detalhe da turma (ver, editar, excluir)

**Como** treinador
**Quero** ver e editar os dados de uma turma e gerenciar seu roster de alunos
**Para** manter a turma atualizada e iniciar treinos a partir dela

**Contexto:** Tela Turmas > toque na turma.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou no detalhe, entao vejo informacoes da turma em modo leitura (InfoRow: nome, filial, dias e horario, nivel, faixa etaria, professor)
- [ ] Dado que toco "Editar", entao os campos ficam editaveis. Ao tocar "Salvar", persiste com toast "Turma salva"
- [ ] Dado que vejo a secao "Alunos matriculados", entao vejo chips com avatar e nome de cada aluno. Toque no chip abre perfil do aluno. "x" no chip remove o aluno da turma.
- [ ] Dado que toco "Iniciar treino", entao inicio o fluxo de treino (Chamada) para essa turma
- [ ] Dado que toco "Excluir turma", entao vejo Sheet de confirmacao. Ao confirmar, turma e removida.

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Estado vazio no roster: "Nenhum aluno na turma. Adicione alunos para fazer a chamada e montar os times." + CTA "Adicionar aluno"
- [ ] Dado que toco "Arquivar turma", entao turma e arquivada com toast

**Fora do escopo desta story:**
- Transferir turma entre filiais

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-009

---

## Epico 4: Alunos

**Outcome do epico:** Treinador consegue cadastrar e acompanhar alunos com perfil gamificado.
**Metricas:** >=10 alunos cadastrados por treinador ativo em 7 dias.

---

### US-011: Listar alunos da turma

**Como** treinador
**Quero** ver todos os alunos da turma atual ordenados por geral
**Para** ter visao rapida do nivel da turma

**Contexto:** Tab "Alunos" na BottomNav.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que tenho alunos na turma, quando acesso a tab Alunos, entao vejo lista ordenada por geral (maior primeiro) com: avatar, nome, posicao, V/D, nota geral (numero grande em verde)
- [ ] Dado que toco em um aluno, entao abro o perfil detalhado (AlunoDetailScreen)
- [ ] Dado que toco no icone "+" no header, entao abro formulario de novo aluno

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Campo de busca visivel no topo (buscar por nome)
- [ ] Estado vazio: orientacao pra adicionar alunos

**Fora do escopo desta story:**
- Filtro por posicao ou nivel

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-009

---

### US-012: Cadastrar aluno

**Como** treinador
**Quero** cadastrar um novo aluno com todos os dados necessarios
**Para** inclui-lo no roster da turma e nos treinos

**Contexto:** Tab Alunos > "+" ou Detalhe da Turma > "Adicionar aluno".

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que estou no formulario de novo aluno, quando preencho: nome completo (obrigatorio), nascimento, genero (M/F/Outro), altura (cm), mao dominante (Destro/Canhoto), posicao principal (single-select LEV/PON/OPO/CEN/LIB), posicoes alternativas (multi-select, exclui a principal), turma(s), data de entrada, contato/responsavel -- e toco "Salvar", entao o aluno e criado
- [ ] Dado que o aluno foi criado, quando vejo a lista, entao ele aparece com geral calculado a partir dos fundamentos iniciais (padrao 3 para todos = geral 73)

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que nome esta vazio, quando tento salvar, entao vejo validacao inline
- [ ] PositionField: ao selecionar posicao principal, ela e removida das opcoes de alternativas automaticamente
- [ ] Explicacao abaixo do PositionField: "A principal vira a tag no card e nos times, e ajuda o balanceador a nao deixar um time sem levantador."

**Fora do escopo desta story:**
- Upload de foto (avatares de iniciais sao usados)

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-011

---

### US-013: Perfil do aluno -- aba Dados

**Como** treinador
**Quero** ver e editar os dados pessoais de um aluno
**Para** manter o cadastro atualizado

**Contexto:** Perfil do aluno > tab "Dados".

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro o perfil do aluno, entao vejo 2 tabs: Dados e Desempenho (Desempenho ativo por padrao)
- [ ] Dado que seleciono tab "Dados", entao vejo: avatar grande + "Trocar foto", campos editaveis (nome, nascimento, genero, altura, mao, PositionField, turma(s), entrada, contato/responsavel)
- [ ] Dado que altero dados e salvo, entao as mudancas sao persistidas
- [ ] Dado que toco "Transferir de turma", entao posso mover o aluno para outra turma
- [ ] Dado que toco "Arquivar aluno", entao o aluno e arquivado

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Validacao nos campos obrigatorios (nome)

**Fora do escopo desta story:**
- Excluir aluno permanentemente (apenas arquivar)

**Prioridade:** Media
**Tamanho:** M (2-3d)
**Dependencias:** US-012

---

### US-014: Perfil do aluno -- aba Desempenho (PlayerCard)

**Como** treinador
**Quero** ver o player card gamificado do aluno com seus fundamentos, geral e retrospecto
**Para** acompanhar a evolucao e motivar o aluno mostrando o card

**Contexto:** Perfil do aluno > tab "Desempenho" (ativo por padrao).

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que o aluno tem >=5 partidas, entao vejo: PlayerCard premium (geral grande, posicao, barras de fundamento, nome, idade, altura, mao, V/D), badges de stats (vitorias, derrotas, aproveitamento, presenca), grafico de evolucao (ultimos 7 treinos), partidas recentes
- [ ] Dado que toco no icone de compartilhar no header, entao abro a tela de Share com o player card do aluno

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que o aluno tem <5 partidas (amostra insuficiente), entao vejo card com aviso: "Amostra insuficiente. Jogue mais treinos para liberar notas confiaveis." -- sem stats, sem grafico, sem partidas
- [ ] PlayerCard mostra fundamentos na ordem: Saque, Ataque, Recepcao, Levantamento, Bloqueio, Defesa (abreviados: Saq, Atq, Rec, Lev, Blo, Def)
- [ ] Meta line do card: "16 anos . 1,82 m . destro . 12V 4D"

**Fora do escopo desta story:**
- Graficos de evolucao com dados reais (mock trend no MVP)

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-012

---

## Epico 5: Chamada / Presenca

**Outcome do epico:** Treinador faz chamada rapida direto na quadra.
**Metricas:** >90% dos treinos tem chamada registrada.

---

### US-015: Fazer chamada

**Como** treinador
**Quero** marcar presenca de cada aluno com um toque (presente / falta / atraso)
**Para** saber quem esta disponivel para montar os times

**Contexto:** Home > selecionar turma > "Iniciar treino" > tela de Chamada.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que iniciei o treino, entao vejo a tela de Chamada com: header (turma + "hoje"), contador (X / total confirmados), lista de alunos com avatar, nome, posicao e toggle tri-state
- [ ] Dado que toco no toggle de um aluno, entao o estado alterna entre presente (verde, check), falta (vermelho, x), atraso (laranja, clock)
- [ ] Dado que >=4 alunos estao com status "presente" ou "atraso", entao o botao "Montar times . X" fica habilitado
- [ ] Dado que <4 alunos confirmados, entao o botao mostra "Marque ao menos 4" e esta desabilitado

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Alunos com "atraso" contam como presentes para fins de montar times
- [ ] Botao voltar retorna para a Home sem perder a selecao da turma
- [ ] Estado de loading: skeleton enquanto carrega roster

**Fora do escopo desta story:**
- Salvar chamada parcial (se sair, perde)

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-012

---

## Epico 6: Montar Times

**Outcome do epico:** Engine divide presentes em 2 times equilibrados automaticamente.
**Metricas:** >70% dos treinos usam "Montar times".

---

### US-016: Montar times automaticamente

**Como** treinador
**Quero** que o app divida os alunos presentes em 2 times equilibrados automaticamente
**Para** ter um jogo justo sem perder tempo dividindo na mao

**Contexto:** Chamada > "Montar times" > tela Montar Times.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que toquei "Montar times" com >=4 presentes, entao vejo 2 TeamPanels (Time A e Time B) com: nomes editaveis, roster com avatar + nome + posicao (LEV destacado em amarelo) + geral, rodape com geral medio + qtd jogadores + status de levantador
- [ ] Dado que o modo e "Competitivo", entao o BalanceIndicator mostra score (%) com titulo "Times equilibrados" ou "Pode melhorar"
- [ ] Dado que o modo e "Desenvolvimento", entao o BalanceIndicator mostra "Times mistos por nivel" com badges topo/meio/base por time e hint explicativo
- [ ] Dado que ha sobra de jogadores alem do tamanho do time, entao a secao "Banco / rodizio" mostra os excedentes como chips

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que nao ha levantadores suficientes, entao aviso: "Um time ficou sem levantador. Ajuste se possivel." (ou "Nenhum levantador presente" se zero)
- [ ] Constraint: engine tenta colocar >=1 canLev (principal ou alternativo) por time. Se nao conseguir, aviso amarelo (nao bloqueia).
- [ ] Opcoes de montagem (card colapsavel): Modo (Competitivo/Desenvolvimento), Tamanho (6x6/7x7), Tratar sobra (Banco/Rodizio). Mudanca remonta na hora.
- [ ] Hint sob modo: "Competitivo: busca o jogo mais parelho" / "Desenvolvimento: cada time recebe mentor + aprendiz"

**Requisitos Nao-Funcionais:**
- [ ] Engine executa em <500ms com 14 jogadores

**Fora do escopo desta story:**
- Customizar pesos do balance engine (feito via Fundamentos Config separadamente)

**Prioridade:** Alta
**Tamanho:** G (4-5d)
**Dependencias:** US-015

---

### US-017: Swap manual e reequilibrar

**Como** treinador
**Quero** trocar um jogador de time com um toque e reequilibrar quando quiser
**Para** ajustar a divisao conforme meu julgamento de quadra

**Contexto:** Tela Montar Times, apos montagem automatica.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que toco em um jogador do Time A, entao ele e movido para o Time B (e vice-versa). O indice de balance recalcula live.
- [ ] Dado que toco "Reequilibrar", entao o engine roda novamente com os presentes atuais e gera nova divisao
- [ ] Dado que renomeio um time (campo editavel no header do TeamPanel), entao o novo nome aparece no resultado e no historico

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Hint abaixo dos times: "Toque em um aluno para troca-lo de time -- o indice recalcula na hora."
- [ ] Apos swap, se um time ficar sem levantador, aviso aparece imediatamente

**Fora do escopo desta story:**
- Drag-and-drop (v1 usa toque simples para swap)

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-016

---

## Epico 7: Registrar Resultado

**Outcome do epico:** Treinador registra o placar da partida de forma rapida.
**Metricas:** >90% dos treinos com times montados tem resultado registrado.

---

### US-018: Registrar resultado da partida

**Como** treinador
**Quero** registrar o placar set a set da partida
**Para** manter o historico e atualizar o retrospecto dos alunos

**Contexto:** Montar Times > "Registrar resultado" > RegistrarResultadoScreen.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que toquei "Registrar resultado", entao vejo: nomes dos times (editaveis), placar geral (setsA x setsB), formato (Set unico / Melhor de 3 / Melhor de 5 / Por tempo), placar por set (ScoreStep com +/- para cada time), selecao de vencedor
- [ ] Dado que preencho os sets, entao o vencedor e calculado automaticamente (quem ganhou mais sets)
- [ ] Dado que toco "Salvar resultado", entao a partida e criada no historico com: elencos dos times, sets, vencedor, equilibrio, data, turma
- [ ] Dado que toco "Salvar e registrar outra partida", entao a partida e salva e o formulario reseta para nova partida (toast "Partida salva . registre outra")

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Dado que seleciono formato "Melhor de 3", entao 3 sets sao exibidos. Posso adicionar/remover sets manualmente.
- [ ] Dado que um set esta empatado, entao aviso amarelo: "Ha um set empatado -- defina o vencedor abaixo."
- [ ] Dado que seleciono vencedor manual (nome do time A ou B), entao o vencedor e forcado independente dos sets
- [ ] Dado que seleciono "W.O. A" ou "W.O. B", entao vitoria por W.O. e registrada sem necessidade de placar completo
- [ ] Dado que nenhum set foi preenchido e nao ha W.O., entao botao "Salvar resultado" esta desabilitado com texto "Defina o vencedor"

**Fora do escopo desta story:**
- Editar resultado (coberta pela US-021)

**Prioridade:** Alta
**Tamanho:** G (4-5d)
**Dependencias:** US-016

---

## Epico 8: Historico e Detalhe da Partida

**Outcome do epico:** Treinador tem visibilidade completa do retrospecto.
**Metricas:** Treinadores consultam historico >=1x/semana.

---

### US-019: Listar historico de partidas

**Como** treinador
**Quero** ver o historico de todas as partidas jogadas
**Para** acompanhar o retrospecto da turma

**Contexto:** Tab "Historico" na BottomNav.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que tenho partidas registradas, entao vejo lista de ResultCards com: data (dia da semana + data), nomes dos times, placar de sets, trofeu no vencedor, roster resumido (3 nomes + "+N"), placar dos sets na base
- [ ] Dado que toco em uma partida, entao abro o Detalhe da Partida
- [ ] Dado que vejo chips de filtro no topo (Todas, Por turma, Por aluno, Mes), entao posso filtrar as partidas

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Estado vazio: "Sem partidas ainda. Monte os times e registre o resultado para comecar o historico." com icone volleyball
- [ ] Estado de loading: skeleton de ResultCards

**Fora do escopo desta story:**
- Busca por texto

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-018

---

### US-020: Detalhe da partida

**Como** treinador
**Quero** ver todos os detalhes de uma partida especifica
**Para** analisar o jogo e compartilhar o resultado

**Contexto:** Historico > toque em uma partida.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro o detalhe, entao vejo: hero card do resultado (nomes, placar, trofeu), set-a-set (cada set com placar e time vencedor destacado), bloco "Como os times foram montados" (equilibrio %, barras de forca por time), elencos completos (chips com avatar, nome, tag LEV se aplicavel)
- [ ] Dado que vejo o bloco de elencos, entao toque em um chip de jogador abre o perfil desse aluno
- [ ] Dado que um jogador foi arquivado, entao seu chip aparece com opacity reduzida e label "arquivado"
- [ ] Hint abaixo dos elencos: "E desta partida que cada jogador herda sua vitoria ou derrota no retrospecto."

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Secao "Acoes" com botoes: Editar resultado, Corrigir elenco, Compartilhar, Ver avaliacoes desse treino, Excluir partida (vermelho)
- [ ] Botao "Excluir partida" abre Sheet de confirmacao: "Os resultados deste jogo serao removidos do retrospecto dos alunos. Esta acao nao pode ser desfeita."

**Fora do escopo desta story:**
- Comparacao entre partidas

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-019

---

### US-021: Editar resultado de partida

**Como** treinador
**Quero** corrigir o resultado de uma partida ja registrada
**Para** consertar erros de digitacao

**Contexto:** Detalhe da partida > "Editar resultado" > RegistrarResultadoScreen modo "edit".

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que toco "Editar resultado", entao RegistrarResultadoScreen abre com nomes e sets pre-preenchidos
- [ ] Dado que altero e salvo, entao o resultado e atualizado no historico com toast "Resultado atualizado"
- [ ] Em modo "edit", o botao "Salvar e registrar outra" nao aparece

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Se nao houver alteracao e salvar, nenhum erro -- apenas persiste com os mesmos dados

**Fora do escopo desta story:**
- Editar elencos (apenas resultado/placar)

**Prioridade:** Media
**Tamanho:** P (<=1d)
**Dependencias:** US-020

---

## Epico 9: Compartilhar

**Outcome do epico:** Treinador gera imagem do resultado ou player card para WhatsApp em 2 toques.
**Metricas:** >50% das partidas compartilhadas.

---

### US-022: Compartilhar resultado como imagem

**Como** treinador
**Quero** gerar uma imagem do resultado da partida e compartilhar via WhatsApp
**Para** comunicar o resultado aos alunos e pais sem montar imagem na mao

**Contexto:** Detalhe da partida > "Compartilhar" > ShareScreen.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro a tela de Compartilhar com um resultado, entao vejo: preview do ShareCard (nome dos times, placar, trofeu no vencedor, data, turma, logo), controles de formato (quadrado/vertical/paisagem), controles de inclusao (toggles: Elencos, Placar set a set, Indice de equilibrio), selecao de tema (Verde/Escuro/Claro -- botoes visuais com background do tema)
- [ ] Dado que altero formato, toggles ou tema, entao o preview atualiza live
- [ ] Dado que toco "Salvar", entao a imagem e gerada (loading overlay "Gerando imagem...") e salva na galeria com toast "Imagem salva na galeria"
- [ ] Dado que toco "Compartilhar", entao a imagem e gerada e a share sheet nativa do OS abre

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Em formato "paisagem", toggle de "Elencos" nao aparece (nao cabe)
- [ ] Tema "Claro" usa textos escuros sobre fundo claro
- [ ] Loading state: overlay com spinner "Gerando imagem..."

**Fora do escopo desta story:**
- Compartilhar como texto

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-020

---

### US-023: Compartilhar player card como imagem

**Como** treinador
**Quero** gerar uma imagem do player card de um aluno e compartilhar
**Para** motivar o aluno e impressionar os pais

**Contexto:** Perfil do aluno > icone de compartilhar > ShareScreen com subject type "aluno".

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro a tela de Compartilhar com um aluno, entao o ShareCard mostra o PlayerCard dentro do formato escolhido, sem toggles de elenco/sets/equilibrio (so formato e tema)
- [ ] Dado que toco "Salvar" ou "Compartilhar", entao a imagem do player card e gerada e salva/compartilhada

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Se aluno tem amostra insuficiente, o card e gerado mesmo assim (mostra o que tem)

**Fora do escopo desta story:**
- Compartilhar multiplos cards de uma vez

**Prioridade:** Media
**Tamanho:** P (<=1d)
**Dependencias:** US-022

---

## Epico 10: Avaliacoes por Treino

**Outcome do epico:** Treinador avalia alunos rapidamente apos cada treino, alimentando o balance engine e o player card.
**Metricas:** >40% dos treinos tem avaliacoes preenchidas.

---

### US-024: Ver avaliacoes de um treino

**Como** treinador
**Quero** ver quais alunos foram avaliados em um treino especifico
**Para** acompanhar o que ja foi preenchido e completar o restante

**Contexto:** Detalhe da partida > "Ver avaliacoes desse treino" > AvaliacoesScreen.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro as avaliacoes de um treino, entao vejo: card de contexto (nomes dos times, data, vencedor), badges de stats (presentes, avaliados, ajustes), lista de presentes com status de avaliacao
- [ ] Para cada aluno avaliado: engajamento (badge ENGAJ. com nota), ajustes (badges coloridos up/down por fundamento)
- [ ] Para cada aluno nao avaliado: label "Presente . nao avaliado" + botao "Avaliar"
- [ ] Clarificacao: "As notas sao do treino, nao da partida. Uma partida gera apenas a vitoria/derrota do time."

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Estado vazio: "Ninguem avaliado neste treino. Registre o engajamento e os ajustes de fundamento dos presentes." + CTA "Avaliar treino"
- [ ] Botao dock: "Completar avaliacoes" abre o primeiro aluno nao avaliado

**Fora do escopo desta story:**
- Excluir avaliacao individual

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-020

---

### US-025: Avaliar aluno individualmente

**Como** treinador
**Quero** avaliar cada aluno presente com engajamento, ajustes de fundamento e observacao
**Para** alimentar o player card e o balance engine com dados atualizados

**Contexto:** AvaliacoesScreen > toque em aluno ou "Completar avaliacoes" > AvaliarAlunoScreen.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro a avaliacao de um aluno, entao vejo: header com avatar + nome + contexto do treino, secao "Fundamentos tecnicos" (cada fundamento com Scale5, nivel atual pre-carregado, badge up/down quando alterado), secao "Engajamento do dia" (Scale5 + botao "Detalhar" que expande soft skills individuais), campo "Observacao do dia" (textarea opcional)
- [ ] Dado que altero um fundamento de 3 para 4, entao badge "up de 3" aparece ao lado
- [ ] Dado que expando "Detalhar" no engajamento, entao vejo Scale5 para cada soft skill ativo (Comportamento, Proatividade, Apoio ao time, Esforco)
- [ ] Dado que toco "Salvar e proximo" (quando ha mais alunos pra avaliar), entao salva e abre o proximo aluno nao avaliado com toast "Avaliacao salva"
- [ ] Dado que toco "Salvar avaliacao" (ultimo aluno ou botao unico), entao salva e volta pra AvaliacoesScreen

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Hint sob fundamentos: "Padrao = sem alteracao. So o que voce mexer vira ajuste -- e alimenta o balanceamento dos times."
- [ ] Hint sob engajamento: "volatil . vira o ENGAJ."
- [ ] Se nao alterar nenhum fundamento e nao marcar engajamento, pode salvar (avaliacao vazia e valida -- significa "sem novidades")
- [ ] Botao dock: 2 botoes quando hasNext ("Salvar" + "Salvar e proximo"), 1 botao quando ultimo ("Salvar avaliacao")

**Fora do escopo desta story:**
- Avaliacao em batch (avaliar todos de uma vez)

**Prioridade:** Alta
**Tamanho:** G (4-5d)
**Dependencias:** US-024

---

## Epico 11: Fundamentos Config

**Outcome do epico:** Treinador customiza quais fundamentos sao avaliados e como pesam no balance.
**Metricas:** >20% dos treinadores alteram a config padrao.

---

### US-026: Configurar fundamentos

**Como** treinador
**Quero** configurar quais fundamentos tecnicos e comportamentais sao usados na avaliacao e no balance
**Para** adaptar o app ao meu estilo de ensino

**Contexto:** Menu > Fundamentos.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro a tela Fundamentos, entao vejo: card explicativo ("Define o que aparece na Avaliacao rapida e o que entra no calculo de equilibrio dos times"), selecao de escala (1 a 3 / 1 a 5 / 1 a 10), lista de tecnicos (drag handle, label, toggle on/off, peso visivel em modo avancado), lista de comportamentais (drag handle, label, toggle on/off)
- [ ] Dado que desativo um fundamento (toggle off), entao ele nao aparece na avaliacao rapida nem no balance engine. Visual fica opaco.
- [ ] Dado que ativo "Mostrar pesos" (toggle avancado), entao os pesos (x1.0, x1.2, x1.3, x1.4) aparecem ao lado de cada fundamento tecnico
- [ ] Dado que toco "Adicionar fundamento", entao posso criar um novo fundamento custom
- [ ] Dado que reordeno com drag, entao a ordem muda na avaliacao rapida

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] "Ao menos um fundamento precisa permanecer ativo." -- impedir desativar o ultimo
- [ ] Fundamentos padrao nao podem ser excluidos (apenas desativados)

**Fora do escopo desta story:**
- Editar peso via input numerico (apenas exibicao no MVP)

**Prioridade:** Media
**Tamanho:** M (2-3d)
**Dependencias:** US-001

---

## Epico 12: Configuracoes

**Outcome do epico:** Treinador personaliza o app conforme suas preferencias.
**Metricas:** >30% dos treinadores alteram ao menos 1 configuracao.

---

### US-027: Configuracoes do app

**Como** treinador
**Quero** ajustar minhas preferencias pessoais e de treino
**Para** que o app funcione do jeito que eu prefiro

**Contexto:** Menu > Configuracoes.

**Criterios de Aceite -- Happy Path:**
- [ ] **Conta:** avatar + nome + email, "Trocar senha" (navega para fluxo Supabase), "Sair" (vermelho, executa logout)
- [ ] **Preferencias do app:** Idioma (read-only "Portugues (BR)"), Tema (Claro / Escuro / Sistema com Segmented -- persistido, "Sistema" segue prefers-color-scheme), Unidade de altura (cm / pol com Segmented)
- [ ] **Preferencias de treino:** Tamanho do time padrao (6x6 / 7x7 com Segmented), Tratar sobra ("Banco / rodizio"), Modo de montagem padrao (Competitivo / Desenvolvimento com Segmented -- usado como default ao montar times)
- [ ] **Dados:** "Exportar dados (CSV)" gera arquivo CSV com dados do treinador, "Backup" (placeholder para v1.1)
- [ ] **Sobre:** "Ajuda", "Sobre o app" (versao v1.0)

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Tema persiste entre sessoes (localStorage / user_metadata do Supabase)
- [ ] Mudanca de tema aplica imediatamente (nao requer reload)
- [ ] Mudanca de preferencias de treino aplica no proximo "Montar times" (nao retroativa)

**Fora do escopo desta story:**
- Notificacoes push
- Alterar idioma

**Prioridade:** Media
**Tamanho:** M (2-3d)
**Dependencias:** US-003

---

## Epico 13: Home e Navegacao

**Outcome do epico:** Treinador acessa todas as funcoes com navegacao clara e rapida.
**Metricas:** Treinador chega de "abrir o app" ate "montar times" em <60 segundos.

---

### US-028: Tela Home

**Como** treinador
**Quero** ver minhas turmas e iniciar um treino rapidamente
**Para** nao perder tempo navegando

**Contexto:** Primeira tela apos login.

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que abro o app logado, entao vejo: logo + brandmark, saudacao ("Bom treino, Tec. [Nome]"), subtitulo "Escolha a turma de hoje", lista de turmas (icone volleyball, nome, filial, dias, qtd alunos, horario, nivel), resumo da semana (badges: treinos, partidas, presenca %), botao dock "Iniciar treino" (disabled ate selecionar turma)
- [ ] Dado que seleciono uma turma (highlight visual), entao o botao dock fica habilitado com "Iniciar treino"
- [ ] Dado que toco "Iniciar treino", entao vou para a tela de Chamada
- [ ] Icone de sino (notificacao) no header (placeholder, nao funcional no MVP)

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Se nao tem turmas: "Selecione uma turma" no botao, estado vazio na lista com CTA pra criar turma
- [ ] "Ver todas" no header de turmas navega pra tela de Turmas

**Fora do escopo desta story:**
- Resumo da semana com dados reais (badges com valores mock no MVP, dados reais apos integracao)

**Prioridade:** Alta
**Tamanho:** M (2-3d)
**Dependencias:** US-009

---

### US-029: BottomNav e Menu

**Como** treinador
**Quero** navegar entre as secoes principais do app com a barra inferior
**Para** acessar tudo com um toque

**Contexto:** Barra inferior presente em todas as telas que nao sao fluxos modais.

**Criterios de Aceite -- Happy Path:**
- [ ] BottomNav com 4 tabs: Inicio (house), Historico (history), Alunos (users), Menu (menu)
- [ ] Tab ativa: icone com stroke mais grosso (2.4) + cor verde + label bold
- [ ] Tab inativa: icone normal (stroke 2) + cor cinza
- [ ] Menu mostra: Filiais, Turmas, Alunos, Fundamentos, Configuracoes -- cada item com icone, titulo e subtitulo descritivo
- [ ] BottomNav oculta durante fluxos modais (Chamada, Montar Times, Registrar Resultado, Perfil do aluno, Detalhe da partida, Share, Avaliacoes)

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Toque em tab ja ativa nao causa reload

**Fora do escopo desta story:**
- Badge de notificacao nas tabs

**Prioridade:** Alta
**Tamanho:** P (<=1d)
**Dependencias:** US-028

---

## Epico 14: Tema Escuro

**Outcome do epico:** App funciona perfeitamente em tema escuro.
**Metricas:** >20% dos treinadores usam tema escuro.

---

### US-030: Tema escuro completo

**Como** treinador
**Quero** usar o app em tema escuro
**Para** reduzir fadiga visual em treinos noturnos e economizar bateria

**Contexto:** Configuracoes > Tema > Escuro ou Sistema (se sistema esta em dark).

**Criterios de Aceite -- Happy Path:**
- [ ] Dado que seleciono tema "Escuro", entao todas as surfaces, textos, borders, sombras, cores de estado remapeiam conforme tokens dark do design system
- [ ] Dark: elevacao por contraste de surface (surface vs surface-2), nao por sombra. Greens e reds mais brilhantes. Navy suave (nunca #000 puro).
- [ ] Dado que seleciono "Sistema", entao o tema segue prefers-color-scheme do OS automaticamente
- [ ] PlayerCard, ShareCard, BalanceIndicator, PresencaToggle, todos os componentes respeitam tokens

**Criterios de Aceite -- Edge Cases e Erros:**
- [ ] Troca de tema e instantanea (sem reload)
- [ ] Tema persiste entre sessoes
- [ ] Contraste AA mantido em ambos os temas

**Fora do escopo desta story:**
- Tema customizado pelo treinador

**Prioridade:** Should
**Tamanho:** M (2-3d)
**Dependencias:** US-027

---

## Resumo de Priorizacao

| Story | Prioridade | Tamanho | Dependencias |
|-------|-----------|---------|--------------|
| US-001 Signup | Alta | P | -- |
| US-002 Login | Alta | P | US-001 |
| US-003 Logout | Alta | P | US-002 |
| US-004 Listar filiais | Alta | P | US-001 |
| US-005 Criar filial | Alta | P | US-004 |
| US-006 Editar filial | Media | P | US-005 |
| US-007 Arquivar/excluir filial | Media | P | US-005 |
| US-008 Listar turmas | Alta | P | US-005 |
| US-009 Criar turma | Alta | P | US-008 |
| US-010 Detalhe turma | Alta | M | US-009 |
| US-011 Listar alunos | Alta | P | US-009 |
| US-012 Cadastrar aluno | Alta | M | US-011 |
| US-013 Perfil - Dados | Media | M | US-012 |
| US-014 Perfil - Desempenho | Alta | M | US-012 |
| US-015 Chamada | Alta | M | US-012 |
| US-016 Montar times | Alta | G | US-015 |
| US-017 Swap + reequilibrar | Alta | M | US-016 |
| US-018 Registrar resultado | Alta | G | US-016 |
| US-019 Historico | Alta | M | US-018 |
| US-020 Detalhe partida | Alta | M | US-019 |
| US-021 Editar resultado | Media | P | US-020 |
| US-022 Share resultado | Alta | M | US-020 |
| US-023 Share player card | Media | P | US-022 |
| US-024 Ver avaliacoes | Alta | M | US-020 |
| US-025 Avaliar aluno | Alta | G | US-024 |
| US-026 Fundamentos config | Media | M | US-001 |
| US-027 Configuracoes | Media | M | US-003 |
| US-028 Tela Home | Alta | M | US-009 |
| US-029 BottomNav + Menu | Alta | P | US-028 |
| US-030 Tema escuro | Should | M | US-027 |

**Total: 30 stories | 12P + 14M + 4G**
