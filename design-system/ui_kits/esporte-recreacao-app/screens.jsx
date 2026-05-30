/* Esporte Recreação — screens. Depends on components.jsx (window globals). */

/* ---------------- HOME ---------------- */
function HomeScreen({ turmas, selected, onSelect, onIniciar }) {
  return (
    <>
      <div className="er-brandrow">
        <img src="assets/logo-mark.svg" alt="" />
        <span className="bw"><small>Esporte</small>Recreação</span>
      </div>
      <Header title="Bom treino, Téc. Marcos" sub="Escolha a turma de hoje" right={<button className="er-iconbtn"><Icon name="bell" size={20} /></button>} />
      <div className="er-body">
        <div className="er-sect"><span className="t">Suas turmas</span><span className="a">Ver todas</span></div>
        <div className="er-list">
          {turmas.map(t => (
            <div key={t.id} className={'er-turma' + (selected === t.id ? ' sel' : '')} onClick={() => onSelect(t.id)}>
              <div className="tdot"><Icon name="volleyball" size={24} /></div>
              <div className="tmid">
                <div className="tn">{t.nome}</div>
                <div className="tmeta">{t.filial} · {t.dias} · {t.n} alunos</div>
              </div>
              <div className="thora">{t.hora}<small>{t.nivel}</small></div>
            </div>
          ))}
        </div>
        <div className="er-sect"><span className="t">Resumo da semana</span></div>
        <div style={{ display: 'flex', gap: 9 }}>
          <StatBadge n="3" label="treinos" tone="neutral" icon="calendar-check" />
          <StatBadge n="6" label="partidas" tone="neutral" icon="volleyball" />
          <StatBadge n="92%" label="presença" tone="win" icon="user-check" />
        </div>
      </div>
      <div className="er-dock above-nav">
        <Button size="lg" full icon="play" disabled={!selected} onClick={onIniciar}>
          {selected ? 'Iniciar treino' : 'Selecione uma turma'}
        </Button>
      </div>
    </>
  );
}

/* ---------------- CHAMADA ---------------- */
function ChamadaScreen({ turma, alunos, presenca, setPresenca, onBack, onAvancar }) {
  const presentes = alunos.filter(a => presenca[a.id] === 'presente' || presenca[a.id] === 'atraso').length;
  return (
    <>
      <Header title="Chamada" sub={turma.nome + ' · hoje'} onBack={onBack} />
      <div style={{ padding: '0 18px' }}>
        <div className="er-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="er-counter"><span className="big">{presentes}</span><span className="tot">/ {alunos.length}</span></span>
          <span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 600 }}>confirmados</span>
        </div>
      </div>
      <div className="er-body" style={{ paddingTop: 14 }}>
        <div className="er-list">
          {alunos.map(a => (
            <div className="er-callrow" key={a.id}>
              <Avatar nome={a.nome} size={40} />
              <div className="cn">
                <div className="nm">{a.nome.split(' ')[0]} {a.nome.split(' ')[1] || ''}</div>
                <div className="mt">{a.posLabel}</div>
              </div>
              <PresencaToggle value={presenca[a.id] || 'pendente'} onChange={v => setPresenca(a.id, v)} compact />
            </div>
          ))}
        </div>
      </div>
      <div className="er-dock">
        <Button size="lg" full icon="arrow-right" disabled={presentes < 4} onClick={onAvancar}>
          {presentes < 4 ? 'Marque ao menos 4' : `Montar times · ${presentes}`}
        </Button>
      </div>
    </>
  );
}

/* ---------------- MONTAR TIMES ---------------- */
function MontarScreen({ teams, opts, onOpt, nameA, nameB, setNameA, setNameB, banco, onBack, onRebalance, onSwap, onRegistrar }) {
  return (
    <>
      <Header title="Montar times" sub={`${teams.t1.length + teams.t2.length} em quadra · ${banco.length} no banco`} onBack={onBack}
        right={<button className="er-iconbtn" onClick={onRebalance}><Icon name="shuffle" size={20} /></button>} />
      <div className="er-body" style={{ paddingTop: 4 }}>
        {/* opções de montagem */}
        <div className="er-card" style={{ padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, whiteSpace: 'nowrap' }}>
            <Icon name="sliders-horizontal" size={16} color="var(--fg-3)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--fg-1)' }}>Opções de montagem</span>
          </div>
          <div style={{ marginBottom: 9 }}>
            <Segmented options={['Competitivo', 'Desenvolvimento']} value={opts.mode} onChange={v => onOpt({ mode: v })} />
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ flex: 1 }}><Segmented options={['6×6', '7×7']} value={opts.size === 7 ? '7×7' : '6×6'} onChange={v => onOpt({ size: v === '7×7' ? 7 : 6 })} /></div>
            <div style={{ flex: 1 }}><Segmented options={['Banco', 'Rodízio']} value={(opts.sobra || '').indexOf('Rod') >= 0 ? 'Rodízio' : 'Banco'} onChange={v => onOpt({ sobra: v === 'Rodízio' ? 'Rodízio' : 'Banco / rodízio' })} /></div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--fg-4)', margin: '9px 2px 0', lineHeight: 1.4 }}>
            {opts.mode === 'Desenvolvimento'
              ? 'Desenvolvimento: cada time recebe mentor + aprendiz. Prioriza a mistura de níveis sobre o placar exato.'
              : 'Competitivo: busca o jogo mais parelho possível (menor diferença de força e por fundamento).'}
          </p>
        </div>

        <BalanceIndicator score={teams.score} mode={opts.mode} mixed={teams.mixed} tiers={teams.tiers} levOk={teams.levOk} levTotal={teams.levTotal} />
        <div className="er-teams er-pad-t">
          <TeamPanel side="A" name={nameA} onRename={setNameA} team={teams.t1} onPlayerTap={p => onSwap(p, 1)} />
          <TeamPanel side="B" name={nameB} onRename={setNameB} team={teams.t2} onPlayerTap={p => onSwap(p, 2)} />
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--fg-4)', textAlign: 'center', margin: '12px 6px 0' }}>
          Toque em um aluno para trocá-lo de time — o índice recalcula na hora.
        </p>
        {banco.length > 0 && (
          <>
            <div className="er-sect"><span className="t">Banco / rodízio</span><span className="a">{banco.length}</span></div>
            <div className="er-chipgrid">{banco.map(p => <Chip key={p.id} aluno={p} showPos />)}</div>
          </>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Button variant="secondary" full icon="shuffle" onClick={onRebalance}>Reequilibrar</Button>
        </div>
      </div>
      <div className="er-dock">
        <Button size="lg" full icon="flag" onClick={onRegistrar}>Registrar resultado</Button>
      </div>
    </>
  );
}

/* ---------------- HISTÓRICO ---------------- */
function HistoricoScreen({ historico, onOpenMatch }) {
  const filtros = ['Todas', 'Por turma', 'Por aluno', 'Maio'];
  return (
    <>
      <Header title="Histórico" sub="Sub-17 Masculino" right={<button className="er-iconbtn"><Icon name="filter" size={19} /></button>} />
      <div style={{ padding: '0 18px 4px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {filtros.map((f, i) => (
          <span key={f} style={{ flex: 'none', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 999, background: i === 0 ? 'var(--green-500)' : 'var(--bg-surface)', color: i === 0 ? '#fff' : 'var(--fg-2)', boxShadow: i === 0 ? 'none' : 'var(--shadow-sm)' }}>{f}</span>
        ))}
      </div>
      <div className="er-body" style={{ paddingTop: 14 }}>
        {historico.length === 0 ? (
          <EmptyState icon="volleyball" title="Sem partidas ainda" desc="Monte os times e registre o resultado para começar o histórico." />
        ) : (
          <div className="er-list">
            {historico.map(m => <ResultCard key={m.id} match={m} onClick={() => onOpenMatch(m)} />)}
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- ALUNOS ---------------- */
function AlunosScreen({ alunos, onOpenAluno }) {
  return (
    <>
      <Header title="Alunos" sub="Sub-17 Masculino · 14" right={<button className="er-iconbtn"><Icon name="user-plus" size={20} /></button>} />
      <div style={{ padding: '0 18px' }}>
        <div className="er-callrow" style={{ boxShadow: 'none', background: 'var(--bg-sunken)' }}>
          <Icon name="search" size={18} color="var(--fg-4)" />
          <span style={{ color: 'var(--fg-4)', fontSize: 14, fontWeight: 500 }}>Buscar aluno…</span>
        </div>
      </div>
      <div className="er-body" style={{ paddingTop: 12 }}>
        <div className="er-list">
          {[...alunos].sort((a, b) => b.geral - a.geral).map(a => (
            <div className="er-callrow" key={a.id} onClick={() => onOpenAluno(a)} style={{ cursor: 'pointer' }}>
              <Avatar nome={a.nome} size={40} />
              <div className="cn">
                <div className="nm">{a.nome}</div>
                <div className="mt">{a.posLabel} · {a.vitorias}V {a.derrotas}D</div>
              </div>
              <span style={{ fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: 22, color: 'var(--green-600)' }}>{a.geral}</span>
              <Icon name="chevron-right" size={20} color="var(--fg-4)" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- FICHA DO ALUNO ---------------- */
function FichaScreen({ aluno, onBack }) {
  const jogos = aluno.vitorias + aluno.derrotas;
  const aprov = Math.round(aluno.vitorias / jogos * 100);
  const evol = [62, 64, 63, 68, 72, 70, aluno.geral]; // mock trend
  const matches = ER.historico.filter(m =>
    m.a.elenco.includes(aluno.nome) || m.b.elenco.includes(aluno.nome));
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 35, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--ink-800)', paddingBottom: 8 }}>
        <StatusBar dark />
        <div className="er-header" style={{ paddingBottom: 8 }}>
          <button className="er-iconbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={onBack}><Icon name="chevron-left" size={22} /></button>
          <div style={{ flex: 1 }}><div className="h-title" style={{ color: '#fff', fontSize: 20 }}>Ficha do aluno</div></div>
          <button className="er-iconbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }}><Icon name="share-2" size={19} /></button>
        </div>
      </div>
      <div className="er-screen">
        <div style={{ background: 'var(--ink-800)', padding: '4px 18px 22px' }}>
          <PlayerCard aluno={aluno} />
        </div>
        <div className="er-body" style={{ paddingTop: 18 }}>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <StatBadge n={aluno.vitorias + 'V'} label="vitórias" tone="win" icon="trophy" />
            <StatBadge n={aluno.derrotas + 'D'} label="derrotas" tone="loss" />
            <StatBadge n={aprov + '%'} label="aproveit." tone="blue" />
            <StatBadge n="89%" label="presença" tone="neutral" icon="user-check" />
          </div>

          <div className="er-sect"><span className="t">Evolução · 7 treinos</span></div>
          <div className="er-card" style={{ padding: '16px', display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {evol.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', height: ((v - 50) / 50 * 76) + 'px', background: i === evol.length - 1 ? 'var(--green-500)' : 'var(--green-200)', borderRadius: 6 }}></div>
                <span style={{ fontSize: 10, color: 'var(--fg-4)', fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="er-sect"><span className="t">Partidas recentes</span><span className="a">Ver tudo</span></div>
          <div className="er-list">
            {matches.map(m => {
              const inA = m.a.elenco.includes(aluno.nome);
              const meu = inA ? m.a.nome : m.b.nome, adv = inA ? m.b.nome : m.a.nome;
              const venceu = (inA && m.vencedor === 'a') || (!inA && m.vencedor === 'b');
              return (
                <div className="er-callrow" key={m.id}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: venceu ? 'var(--win-bg)' : 'var(--loss-bg)', color: venceu ? 'var(--win-700)' : 'var(--loss-700)', fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: 17 }}>{venceu ? 'V' : 'D'}</div>
                  <div className="cn">
                    <div className="nm">{meu} <span style={{ color: 'var(--fg-4)', fontWeight: 600 }}>× {adv}</span></div>
                    <div className="mt">{m.dataFull}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 600 }}>{m.sets.length} sets</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, ChamadaScreen, MontarScreen, HistoricoScreen, AlunosScreen, FichaScreen });

/* ---------------- ALUNO DETAIL (two tabs: Dados / Desempenho) ---------------- */
function AlunoDesempenho({ aluno }) {
  const jogos = aluno.vitorias + aluno.derrotas;
  const aprov = jogos ? Math.round(aluno.vitorias / jogos * 100) : 0;
  const insuf = jogos < 5;
  const evol = [62, 64, 63, 68, 72, 70, aluno.geral];
  const matches = ER.historico.filter(m => m.a.elenco.includes(aluno.nome) || m.b.elenco.includes(aluno.nome));
  return (
    <>
      <div style={{ background: 'var(--ink-800)', padding: '14px 18px 22px' }}><PlayerCard aluno={aluno} /></div>
      <div className="er-body" style={{ paddingTop: 18 }}>
        {insuf ? (
          <div className="er-card" style={{ padding: '16px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <Icon name="info" size={20} color="var(--warn-500)" />
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.45 }}><b>Amostra insuficiente.</b> Jogue mais treinos para liberar notas confiáveis.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              <StatBadge n={aluno.vitorias + 'V'} label="vitórias" tone="win" icon="trophy" />
              <StatBadge n={aluno.derrotas + 'D'} label="derrotas" tone="loss" />
              <StatBadge n={aprov + '%'} label="aproveit." tone="blue" />
              <StatBadge n="89%" label="presença" tone="neutral" icon="user-check" />
            </div>
            <div className="er-sect"><span className="t">Evolução · 7 treinos</span></div>
            <div className="er-card" style={{ padding: '16px', display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {evol.map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', height: ((v - 50) / 50 * 76) + 'px', background: i === evol.length - 1 ? 'var(--green-500)' : 'var(--green-200)', borderRadius: 6 }}></div>
                  <span style={{ fontSize: 10, color: 'var(--fg-4)', fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="er-sect"><span className="t">Partidas recentes</span><span className="a">Ver tudo</span></div>
            <div className="er-list">
              {matches.map(m => {
                const inA = m.a.elenco.includes(aluno.nome);
                const meu = inA ? m.a.nome : m.b.nome, adv = inA ? m.b.nome : m.a.nome;
                const venceu = (inA && m.vencedor === 'a') || (!inA && m.vencedor === 'b');
                return (
                  <div className="er-callrow" key={m.id}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: venceu ? 'var(--win-bg)' : 'var(--loss-bg)', color: venceu ? 'var(--win-700)' : 'var(--loss-700)', fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: 17 }}>{venceu ? 'V' : 'D'}</div>
                    <div className="cn"><div className="nm">{meu} <span style={{ color: 'var(--fg-4)', fontWeight: 600 }}>× {adv}</span></div><div className="mt">{m.dataFull}</div></div>
                    <span style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 600 }}>{m.sets.length} sets</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function AlunoDados({ aluno }) {
  return (
    <div className="er-body" style={{ paddingTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <Avatar nome={aluno.nome} size={64} />
        <Button variant="secondary" icon="camera">Trocar foto</Button>
      </div>
      <Field label="Nome completo" value={aluno.nome} />
      <div className="er-fieldrow">
        <Field label="Nascimento" value={'12/03/' + (2026 - aluno.idade)} />
        <Field label="Gênero" value={['Bruno', 'Lucas', 'Pedro', 'Diego', 'Rafael', 'Thiago', 'Gustavo', 'André'].includes(aluno.nome.split(' ')[0]) ? 'Masculino' : 'Feminino'} options={['Masculino', 'Feminino', 'Outro']} />
      </div>
      <div className="er-fieldrow">
        <Field label="Altura (cm)" value={String(aluno.altura)} type="number" />
        <Field label="Mão dominante" value={aluno.mao} options={['Destro', 'Destra', 'Canhoto', 'Canhota']} />
      </div>
      <PositionField principal={aluno.pos} alternativas={aluno.posAlt} />
      <div className="er-fieldrow">
        <Field label="Turma(s)" value="Sub-17 Masculino" options={ER.turmas.map(t => t.nome)} />
        <Field label="Entrada" value={'mar/2024'} />
      </div>
      <Field label="Contato / responsável" value="(11) 99876-5432 · Sandra (mãe)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <Button variant="secondary" full icon="arrow-left-right">Transferir de turma</Button>
        <Button variant="ghost" full icon="archive">Arquivar aluno</Button>
      </div>
    </div>
  );
}

function AlunoDetailScreen({ aluno, onBack, onShare }) {
  const [tab, setTab] = useState('Desempenho');
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 45, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--ink-800)' }}>
        <StatusBar dark />
        <div className="er-header" style={{ paddingBottom: 12 }}>
          <button className="er-iconbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={onBack}><Icon name="chevron-left" size={22} /></button>
          <div style={{ flex: 1 }}><div className="h-title" style={{ color: '#fff', fontSize: 20 }}>Perfil do aluno</div></div>
          <button className="er-iconbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={() => onShare && onShare(aluno)}><Icon name="share-2" size={19} /></button>
        </div>
      </div>
      <div style={{ background: 'var(--ink-800)', paddingBottom: 14 }}>
        <Tabs tabs={['Dados', 'Desempenho']} active={tab} onChange={setTab} />
      </div>
      <div className="er-screen">
        {tab === 'Desempenho' ? <AlunoDesempenho aluno={aluno} /> : <AlunoDados aluno={aluno} />}
      </div>
    </div>
  );
}

Object.assign(window, { AlunoDetailScreen });

/* ---------------- PARTIDA DETAIL (from Histórico) ---------------- */
function PartidaDetailScreen({ match, onBack, openAluno, onDelete, onToast, onShare, onVerAvaliacoes, onEdit }) {
  const [confirm, setConfirm] = useState(false);
  const setsA = match.sets.filter(s => s[0] > s[1]).length;
  const setsB = match.sets.filter(s => s[1] > s[0]).length;
  const aWin = match.vencedor === 'a', bWin = match.vencedor === 'b';
  const byName = n => ER.alunos.find(a => a.nome === n);
  const forca = elenco => elenco.reduce((sum, n) => { const a = byName(n); return sum + (a ? a.geral : 0); }, 0);
  const fA = forca(match.a.elenco), fB = forca(match.b.elenco);
  const fMax = Math.max(fA, fB) || 1;

  const TeamHd = ({ team, win, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--fg-1)' }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: color }}></span>{team.nome}
      </span>
      <span className={'er-badge ' + (win ? 'win' : 'loss')} style={{ padding: '4px 10px' }}>
        {win && <Icon name="trophy" size={14} />}<span style={{ fontSize: 12, fontWeight: 700 }}>{win ? 'Vitória' : 'Derrota'}</span>
      </span>
    </div>
  );
  const Roster = ({ elenco }) => (
    <div className="er-chipgrid" style={{ marginBottom: 18 }}>
      {elenco.map(n => {
        const a = byName(n);
        return a
          ? <span className="er-chip" key={n} onClick={() => openAluno(a)}><Avatar nome={n} size={30} />{n.split(' ')[0]}{a.pos === 'LEV' && <span className="pos">LEV</span>}</span>
          : <span className="er-chip" key={n} style={{ opacity: .6 }}><Avatar nome={n} size={30} />{n.split(' ')[0]} <span style={{ fontSize: 10, color: 'var(--fg-4)' }}>arquivado</span></span>;
      })}
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 34, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--ink-800)' }}>
        <StatusBar dark />
        <div className="er-header" style={{ paddingBottom: 12 }}>
          <button className="er-iconbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={onBack}><Icon name="chevron-left" size={22} /></button>
          <div style={{ flex: 1 }}><div className="h-title" style={{ color: '#fff', fontSize: 20 }}>Detalhe da partida</div></div>
          <button className="er-iconbtn" style={{ background: 'rgba(255,255,255,.12)', color: '#fff' }} onClick={() => onShare(match)}><Icon name="share-2" size={19} /></button>
        </div>
      </div>
      <div className="er-screen">
        <div className="er-body" style={{ paddingTop: 16 }}>
          {/* result hero */}
          <div className="er-result" style={{ cursor: 'default' }}>
            <div className="date" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={14} />{match.dataFull} · {match.turma}</span>
              {match.jogos > 1 && <span>Jogo {match.jogo} de {match.jogos}</span>}
            </div>
            <div className="match">
              <div className="team"><span className={'tn' + (aWin ? ' win' : '')}>{aWin && <Icon name="trophy" size={16} color="var(--yellow-500)" />}{match.a.nome}</span></div>
              <div className="score"><span style={aWin ? { color: 'var(--win-700)' } : {}}>{setsA}</span><span className="x">×</span><span style={bWin ? { color: 'var(--win-700)' } : {}}>{setsB}</span></div>
              <div className="team b"><span className={'tn' + (bWin ? ' win' : '')}>{bWin && <Icon name="trophy" size={16} color="var(--yellow-500)" />}{match.b.nome}</span></div>
            </div>
          </div>

          {/* set a set */}
          <div className="er-sect"><span className="t">Set a set</span></div>
          <div className="er-group">
            {match.sets.map((s, i) => {
              const aw = s[0] > s[1];
              return (
                <div className="er-srow" key={i} style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--fg-4)', letterSpacing: '.04em', width: 52 }}>SET {i + 1}</span>
                  <span style={{ flex: 1, textAlign: 'right', fontWeight: aw ? 800 : 500, color: aw ? 'var(--win-700)' : 'var(--fg-2)' }}>{match.a.nome}</span>
                  <span style={{ fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: 18, padding: '0 12px', color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flex: 'none' }}>{s[0]} <span style={{ color: 'var(--fg-4)' }}>×</span> {s[1]}</span>
                  <span style={{ flex: 1, fontWeight: !aw ? 800 : 500, color: !aw ? 'var(--win-700)' : 'var(--fg-2)' }}>{match.b.nome}</span>
                </div>
              );
            })}
          </div>

          {/* como os times foram montados */}
          {match.equilibrio && (
            <>
              <div className="er-sect"><span className="t">Como os times foram montados</span></div>
              <div className="er-balance">
                <div className="top">
                  <span className="ttl"><Icon name="scale" size={18} color="var(--bal-500)" />Equilíbrio na montagem</span>
                  <span className="pct" style={{ color: 'var(--bal-700)' }}>{match.equilibrio}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {[[match.a.nome, fA, 'var(--green-500)'], [match.b.nome, fB, 'var(--ink-700)']].map(([nm, f, c]) => (
                    <div key={nm} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 76, fontSize: 12, fontWeight: 700, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nm}</span>
                      <span style={{ flex: 1, height: 10, borderRadius: 999, background: 'var(--gray-200)', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: (f / fMax * 100) + '%', background: c, borderRadius: 999 }}></i></span>
                      <span style={{ fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: 14, width: 32, textAlign: 'right' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <p className="hint">Força = somatório das notas gerais usadas no balanceamento.</p>
              </div>
            </>
          )}

          {/* elencos */}
          <div className="er-sect"><span className="t">Elencos completos</span></div>
          <TeamHd team={match.a} win={aWin} color="var(--green-500)" />
          <Roster elenco={match.a.elenco} />
          <TeamHd team={match.b} win={bWin} color="var(--ink-700)" />
          <Roster elenco={match.b.elenco} />
          <p style={{ fontSize: 11.5, color: 'var(--fg-4)', margin: '-6px 2px 0' }}>É desta partida que cada jogador herda sua vitória ou derrota no retrospecto.</p>

          {/* ações */}
          <div className="er-sect"><span className="t">Ações</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="secondary" full icon="pencil" onClick={() => onEdit(match)}>Editar resultado</Button>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" full icon="users" onClick={() => onToast('Corrigir elenco')}>Corrigir elenco</Button>
              <Button variant="ghost" full icon="image" onClick={() => onShare(match)}>Compartilhar</Button>
            </div>
            <Button variant="ghost" full icon="clipboard-list" onClick={() => onVerAvaliacoes(match)}>Ver avaliações desse treino</Button>
            <button className="er-btn ghost sz-md full" style={{ color: 'var(--loss-500)' }} onClick={() => setConfirm(true)}><Icon name="trash-2" size={18} />Excluir partida</button>
          </div>
        </div>
      </div>

      {confirm && (
        <Sheet title="Excluir partida?" onClose={() => setConfirm(false)}>
          <p style={{ margin: '0 0 18px', color: 'var(--fg-3)', fontSize: 13.5 }}>Os resultados deste jogo serão removidos do retrospecto dos alunos. Esta ação não pode ser desfeita.</p>
          <button className="er-btn sz-lg full" style={{ background: 'var(--loss-500)', color: '#fff' }} onClick={() => { setConfirm(false); onDelete(match.id); }}><Icon name="trash-2" size={20} />Excluir partida</button>
          <button className="er-btn ghost sz-md full" style={{ marginTop: 10 }} onClick={() => setConfirm(false)}>Cancelar</button>
        </Sheet>
      )}
    </div>
  );
}

Object.assign(window, { PartidaDetailScreen });
