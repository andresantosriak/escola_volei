# Esporte Recreacao — UI Flow

Fluxo de telas, navegacao e estados de UI do app Esporte Recreacao. Complementa `docs/escola-volei-design-system.md` com o mapeamento de wireframes e interacoes.

---

## 1. Fluxo Principal (Daily Path)

```
Inicio (pick turma) -> Iniciar treino -> Chamada (presenca toggles) -> Montar times (auto-balanced) -> Registrar resultado (score entry) -> Detalhe da partida -> Historico
```

Esse e o caminho que o tecnico percorre a cada treino. Tudo otimizado para poucos toques, uma mao, em quadra.

## 2. Fluxo de Gestao (Management)

```
Menu -> Filiais (list -> detail view/edit/new)
     -> Turmas (list -> detail view/edit/new)
     -> Alunos (via tab Alunos -> perfil)
     -> Fundamentos (configurar avaliacao)
     -> Configuracoes (conta, preferencias, dados, sobre)
```

Area de gestao usa back-stack (push/pop). Cada detalhe abre em tela cheia com botao voltar.

## 3. Fluxos Secundarios

```
Historico -> Partida Detail -> Compartilhar (imagem)
                            -> Avaliacoes do treino -> Avaliar aluno individual
                            -> Editar resultado

Alunos -> Perfil do aluno -> Compartilhar (player card imagem)

Montar times -> Registrar resultado -> Salvar e registrar outra (loop)
```

## 4. Mapa de Navegacao Completo

```
/ (Home — tab inicio)
|-- Iniciar treino (requer turma selecionada)
|   |-- /chamada
|   |   |-- /montar-times
|   |       |-- /registrar-resultado
|   |       |-- /registrar-resultado (edit mode, via partida detail)
|
|-- /historico (tab historico)
|   |-- /historico/:id (detalhe da partida)
|       |-- /historico/:id/compartilhar
|       |-- /historico/:id/avaliacoes
|       |   |-- /historico/:id/avaliacoes/:alunoId
|       |-- /historico/:id/editar
|
|-- /alunos (tab alunos)
|   |-- /alunos/:id (perfil — tabs Dados/Desempenho)
|       |-- /alunos/:id/compartilhar
|
|-- /menu (tab menu)
    |-- /filiais
    |   |-- /filiais/:id
    |   |-- /filiais/nova
    |-- /turmas
    |   |-- /turmas/:id
    |   |-- /turmas/nova
    |-- /fundamentos
    |-- /configuracoes

Rotas de erro:
|-- /* (catch-all -> 404)
|-- Error Boundary -> 500
```

## 5. Padrao de Navegacao

| Tipo | Padrao | Componente |
|------|--------|-----------|
| Tabs principais | BottomNav fixo (4 tabs) | Troca de tab = substituicao de conteudo |
| Drill-down | Full-screen overlay (z-35+) | Perfil aluno, detalhe partida, compartilhar |
| Back-stack (gestao) | Push/pop com Header back button | Filiais, turmas, config |
| Overlay/modal | Sheet bottom com scrim | Confirmacoes, opcoes rapidas |
| Fluxo linear | Forward-only com back | Chamada -> Montar -> Registrar |

## 6. Transicoes entre Telas

| Transicao | Animacao |
|-----------|----------|
| Tab switch | Sem animacao (swap imediato) |
| Push drill-down | Slide-in from right (300ms ease-out) |
| Pop (voltar) | Slide-out to right (300ms ease-out) |
| Sheet abrir | Fade scrim + slide-up sheet (280ms ease-out) |
| Sheet fechar | Fade out scrim + slide-down (200ms ease-out) |
| Overlay abrir (perfil, partida) | Immediate (sem animacao — overlays sao z-layer) |

## 7. Resumo de Estados por Tela

Ver `docs/escola-volei-design-system.md` secao 12 para detalhes completos. Abaixo o resumo:

| Tela | Loading | Empty | Error | Success |
|------|---------|-------|-------|---------|
| Home | Skeleton cards + badges | EmptyState "Nenhuma turma" | Toast sonner | Turma selecionada -> border green |
| Chamada | Skeleton rows | N/A (turma tem alunos) | Toast sonner | Counter atualiza em tempo real |
| Montar times | N/A (dados ja em memoria) | N/A | Warning sem levantador | BalanceIndicator verde |
| Registrar resultado | N/A | N/A | Set empatado warning | Toast "Resultado salvo" |
| Historico | Skeleton ResultCards | EmptyState "Sem partidas" | Toast sonner | N/A |
| Partida detail | Skeleton body | N/A | Toast sonner | Toast "Resultado editado" |
| Alunos | Skeleton rows | EmptyState "Nenhum aluno" | Toast sonner | N/A |
| Perfil aluno | Skeleton PlayerCard + stats | Amostra insuficiente (info card) | Toast sonner | N/A |
| Compartilhar | N/A | N/A | Toast sonner | Overlay "Gerando imagem..." -> Toast sucesso |
| Avaliacoes | Skeleton rows | EmptyState "Ninguem avaliado" | Toast sonner | Tag "avaliado" + ajustes |
| Avaliar aluno | N/A | N/A | N/A | Toast "Avaliacao salva" |
| Filiais | Skeleton mrows | EmptyState "Nenhuma filial" | Toast sonner | Toast "Filial salva/criada" |
| Turmas | Skeleton mrows | EmptyState na filial | Toast sonner | Toast "Turma salva/criada" |
| Fundamentos | N/A (config local) | N/A | N/A | Toast "Fundamentos salvos" |
| Config | N/A | N/A | N/A | Segmented changes imediatos |

## 8. Acoes Destrutivas — Padrao

Toda acao destrutiva segue o mesmo padrao:

1. Botao com texto loss-500 (ex: "Excluir partida")
2. Abre Sheet com:
   - Titulo interrogativo ("Excluir partida?")
   - Descricao explicando consequencias
   - Button destructive full-width ("Excluir partida")
   - Button ghost full-width ("Cancelar")
3. Excecao: filial com turmas ativas — botao fica em fg-4 (cinza) + texto explicativo com icone lock

## 9. Toast Notifications (Sonner)

| Contexto | Mensagem | Tipo |
|----------|----------|------|
| Salvar resultado | "Resultado salvo com sucesso" | success |
| Editar resultado | "Resultado editado" | success |
| Excluir partida | "Partida excluida" | default |
| Criar filial | "Filial criada" | success |
| Salvar filial | "Filial salva" | success |
| Arquivar filial | "Filial arquivada" | default |
| Criar turma | "Turma criada" | success |
| Salvar turma | "Turma salva" | success |
| Excluir turma | "Turma excluida" | default |
| Arquivar turma | "Turma arquivada" | default |
| Salvar avaliacao | "Avaliacao salva" | success |
| Erro de rede | "Erro ao carregar. Tente novamente." | error |
| Filial locked | "Mova ou arquive as turmas primeiro" | warning |
| Gerar imagem | "Imagem salva na galeria" / "Pronto para compartilhar" | success |
