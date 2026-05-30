/* Esporte Recreação — app shell, navigation, result flow, mount. */

function MenuScreen({ onOpen, onTab }) {
  const items = [
    { icon: 'building-2', t: 'Filiais', s: ER.filiais.length + ' unidades', go: () => onOpen('filiais') },
    { icon: 'users-round', t: 'Turmas', s: ER.turmas.length + ' turmas ativas', go: () => onOpen('turmas') },
    { icon: 'user', t: 'Alunos', s: ER.alunos.length + ' na turma atual', go: () => onTab('alunos') },
    { icon: 'sliders-horizontal', t: 'Fundamentos', s: 'Configurar avaliação', go: () => onOpen('fundamentos') },
    { icon: 'settings', t: 'Configurações', s: 'Conta e preferências', go: () => onOpen('config') },
  ];
  return (
    <>
      <div className="er-brandrow"><img src="assets/logo-mark.svg" alt="" /><span className="bw"><small>Esporte</small>Recreação</span></div>
      <Header title="Menu" sub="Gerenciamento" />
      <div className="er-body" style={{ paddingTop: 4 }}>
        <div className="er-list">
          {items.map(it => (
            <div className="er-mrow" key={it.t} onClick={it.go}>
              <div className="micon"><Icon name={it.icon} size={21} /></div>
              <div className="mbody"><div className="mt">{it.t}</div><div className="ms">{it.s}</div></div>
              <Icon name="chevron-right" size={20} color="var(--fg-4)" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ResultadoSheet({ teams, nameA, nameB, onClose, onSave }) {
  const [setsA, setSetsA] = useState(2);
  const [setsB, setSetsB] = useState(1);
  const venc = setsA === setsB ? null : (setsA > setsB ? 'a' : 'b');
  return (
    <Sheet title="Registrar resultado" onClose={onClose}>
      <p style={{ margin: '0 0 16px', color: 'var(--fg-3)', fontSize: 13.5 }}>Quem venceu o jogo de hoje?</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: 14, border: '2px solid ' + (venc === 'a' ? 'var(--green-500)' : 'var(--border-2)'), background: venc === 'a' ? 'var(--green-50)' : 'transparent' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--fg-1)', marginBottom: 8 }}>{nameA}</div>
          <Stepper value={setsA} onChange={setSetsA} min={0} max={3} />
          <div style={{ fontSize: 10, color: 'var(--fg-4)', fontWeight: 700, marginTop: 6, letterSpacing: '.05em' }}>SETS</div>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--fg-4)', fontSize: 18 }}>×</span>
        <div style={{ flex: 1, textAlign: 'center', padding: '14px 8px', borderRadius: 14, border: '2px solid ' + (venc === 'b' ? 'var(--ink-700)' : 'var(--border-2)'), background: venc === 'b' ? 'var(--bal-bg)' : 'transparent' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--fg-1)', marginBottom: 8 }}>{nameB}</div>
          <Stepper value={setsB} onChange={setSetsB} min={0} max={3} />
          <div style={{ fontSize: 10, color: 'var(--fg-4)', fontWeight: 700, marginTop: 6, letterSpacing: '.05em' }}>SETS</div>
        </div>
      </div>
      <Button size="lg" full icon="check" disabled={!venc} onClick={() => onSave({ setsA, setsB, venc })}>
        {venc ? 'Salvar partida' : 'Empate não é permitido'}
      </Button>
      <button className="er-btn ghost sz-md full" style={{ marginTop: 10 }} onClick={onClose}>Cancelar</button>
    </Sheet>
  );
}

function App() {
  const [tab, setTab] = useState('inicio');
  const [flow, setFlow] = useState(null); // 'chamada' | 'montar'
  const [selTurma, setSelTurma] = useState(null);
  const [presenca, setPresencaState] = useState({});
  const [teams, setTeams] = useState({ t1: [], t2: [], score: 0 });
  const [banco, setBanco] = useState([]);
  const [presentes, setPresentes] = useState([]);
  const [montOpts, setMontOpts] = useState({ mode: 'Competitivo', size: 6, sobra: 'Banco / rodízio' });
  const [nameA, setNameA] = useState('Furacão');
  const [nameB, setNameB] = useState('Tubarões');
  const [ficha, setFicha] = useState(null);
  const [partida, setPartida] = useState(null);
  const [share, setShare] = useState(null);
  const [sessao, setSessao] = useState(null);
  const [sessAval, setSessAval] = useState(ER.sessaoAval);
  const [avaliar, setAvaliar] = useState(null); // alunoId being evaluated
  const [registrar, setRegistrar] = useState(null); // {mode:'new'|'edit', match?}
  const [historico, setHistorico] = useState(ER.historico);
  const [toast, setToast] = useState(null);
  const [mstack, setMstack] = useState([]); // management nav stack
  const [theme, setThemeRaw] = useState(() => { try { return localStorage.getItem('er-theme') || 'Claro'; } catch (e) { return 'Claro'; } });
  const setTheme = v => { setThemeRaw(v); try { localStorage.setItem('er-theme', v); } catch (e) { } };
  const sysDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'Escuro' || (theme === 'Sistema' && sysDark);

  const mpush = s => setMstack(st => [...st, s]);
  const mpop = () => setMstack(st => st.slice(0, -1));
  const nav = { push: mpush, pop: mpop, openAluno: a => setFicha(a) };

  const turma = ER.turmas.find(t => t.id === selTurma) || ER.turmas[0];
  const alunos = ER.alunos;

  function setPresenca(id, v) { setPresencaState(p => ({ ...p, [id]: v })); }

  function iniciar() {
    const init = {};
    // pre-fill a realistic roll: most present, a couple falta/atraso
    alunos.forEach((a, i) => { init[a.id] = i % 7 === 5 ? 'falta' : (i % 9 === 4 ? 'atraso' : 'presente'); });
    setPresencaState(init);
    setFlow('chamada');
  }

  function montar(present, opts) {
    const r = ER.buildTeams(present, opts);
    setTeams(r);
    setBanco(r.bench);
  }

  function avancar() {
    const present = alunos.filter(a => ['presente', 'atraso'].includes(presenca[a.id]));
    setPresentes(present);
    montar(present, montOpts);
    setFlow('montar');
  }

  function setOpt(patch) {
    const next = { ...montOpts, ...patch };
    setMontOpts(next);
    montar(presentes, next);
  }

  function rebalance() {
    montar(presentes, montOpts);
  }

  function swap(player, fromTeam) {
    setTeams(prev => {
      let t1 = prev.t1.filter(p => p.id !== player.id);
      let t2 = prev.t2.filter(p => p.id !== player.id);
      if (fromTeam === 1) t2 = [...t2, player]; else t1 = [...t1, player];
      const tm = prev.tierMap || ER.tierMap([...t1, ...t2, ...banco]);
      const bothTiers = [...t1, ...t2].some(p => tm[p.id] === 'topo') && [...t1, ...t2].some(p => tm[p.id] === 'base');
      const mixed = bothTiers && ER.tiersOf(t1, tm).topo >= 1 && ER.tiersOf(t1, tm).base >= 1 && ER.tiersOf(t2, tm).topo >= 1 && ER.tiersOf(t2, tm).base >= 1;
      return { ...prev, t1, t2, score: ER.balanceScore(t1, t2), mixed, levOk: t1.some(ER.canLev) && t2.some(ER.canLev), tiers: { t1: ER.tiersOf(t1, tm), t2: ER.tiersOf(t2, tm) }, tierMap: tm };
    });
  }

  function saveResult({ sets, nameA: nA, nameB: nB, vencedor, another }) {
    const ctx = registrar || { mode: 'new' };
    if (ctx.mode === 'edit') {
      const m = { ...ctx.match, a: { ...ctx.match.a, nome: nA }, b: { ...ctx.match.b, nome: nB }, sets, vencedor };
      setHistorico(h => h.map(x => x.id === m.id ? m : x));
      setNameA(nA); setNameB(nB); setRegistrar(null); setPartida(m);
      showToast('Resultado atualizado');
      return;
    }
    const m = {
      id: 'm' + Date.now(), data: 'hoje', dataFull: 'Hoje · ' + new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      turma: turma.nome,
      a: { nome: nA, elenco: teams.t1.map(p => p.nome) },
      b: { nome: nB, elenco: teams.t2.map(p => p.nome) },
      sets, vencedor, equilibrio: teams.score, jogo: 1, jogos: 1,
    };
    setHistorico(h => [m, ...h]);
    setNameA(nA); setNameB(nB);
    if (another) { setRegistrar({ mode: 'new', _n: Date.now() }); showToast('Partida salva · registre outra'); }
    else { setRegistrar(null); setFlow(null); setTab('historico'); setPartida(m); }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2200); }
  function deletePartida(id) { setHistorico(h => h.filter(m => m.id !== id)); setPartida(null); showToast('Partida excluída'); }

  const presentIds = sessao ? [...new Set([...sessao.a.elenco, ...sessao.b.elenco])].map(n => ER.alunos.find(a => a.nome === n)).filter(Boolean).map(a => a.id) : [];
  function saveAval({ alunoId, engajamento, ajustes }, next) {
    const updated = { ...sessAval, [alunoId]: { engajamento: engajamento || 0, ajustes } };
    setSessAval(updated);
    if (next) { const nx = presentIds.find(id => id !== alunoId && !updated[id]); if (nx) { setAvaliar(nx); showToast('Avaliação salva'); return; } }
    setAvaliar(null); showToast('Avaliação salva');
  }
  function completarAval() { const first = presentIds.find(id => !sessAval[id]) || presentIds[0]; setAvaliar(first); }

  // ---- render content ----
  let content, dark = false, showNav = true;
  if (mstack.length) {
    const top = mstack[mstack.length - 1];
    const key = typeof top === 'string' ? top : top.key;
    showNav = false;
    if (key === 'filiais') content = <FiliaisScreen onBack={mpop} nav={nav} />;
    else if (key === 'turmas') content = <TurmasScreen onBack={mpop} nav={nav} />;
    else if (key === 'fundamentos') content = <FundamentosScreen onBack={mpop} />;
    else if (key === 'config') content = <ConfigScreen onBack={mpop} theme={theme} onTheme={setTheme} />;
    else if (key === 'filialDetail') content = <FilialDetailScreen filial={ER.filiais.find(f => f.id === top.id)} onBack={mpop} nav={nav} onToast={showToast} />;
    else if (key === 'filialNew') content = <FilialDetailScreen mode="new" onBack={mpop} nav={nav} onToast={showToast} />;
    else if (key === 'turmaNew') content = <TurmaDetailScreen mode="new" filialId={top.filialId} onBack={mpop} nav={nav} onToast={showToast} />;
    else if (key === 'turmaDetail') {
      const t = ER.turmas.find(x => x.id === top.id);
      content = <TurmaDetailScreen turma={t} onBack={mpop} nav={nav} onToast={showToast} onIniciar={() => { setSelTurma(t.id); setMstack([]); iniciar(); }} />;
    }
  }
  else if (flow === 'chamada') { content = <ChamadaScreen turma={turma} alunos={alunos} presenca={presenca} setPresenca={setPresenca} onBack={() => setFlow(null)} onAvancar={avancar} />; showNav = false; }
  else if (flow === 'montar') { content = <MontarScreen teams={teams} opts={montOpts} onOpt={setOpt} nameA={nameA} nameB={nameB} setNameA={setNameA} setNameB={setNameB} banco={banco} onBack={() => setFlow('chamada')} onRebalance={rebalance} onSwap={swap} onRegistrar={() => setRegistrar({ mode: 'new' })} />; showNav = false; }
  else if (tab === 'inicio') content = <HomeScreen turmas={ER.turmas} selected={selTurma} onSelect={setSelTurma} onIniciar={iniciar} />;
  else if (tab === 'historico') content = <HistoricoScreen historico={historico} onOpenMatch={setPartida} />;
  else if (tab === 'alunos') content = <AlunosScreen alunos={alunos} onOpenAluno={setFicha} />;
  else if (tab === 'menu') content = <MenuScreen onOpen={mpush} onTab={t => { setMstack([]); setTab(t); }} />;

  return (
    <div className="er-stage">
      <div className="er-phone" id="erPhone" data-theme={isDark ? 'dark' : 'light'}>
        <div className="er-notch"></div>
        <StatusBar dark={dark} />
        <div className="er-screen">{content}</div>
        {showNav && <BottomNav tab={tab} onTab={t => { setFlow(null); setMstack([]); setTab(t); }} />}
        {registrar && <RegistrarResultadoScreen key={registrar._n || registrar.mode + (registrar.match ? registrar.match.id : '')} mode={registrar.mode} nameA={registrar.mode === 'edit' ? registrar.match.a.nome : nameA} nameB={registrar.mode === 'edit' ? registrar.match.b.nome : nameB} initialSets={registrar.mode === 'edit' ? registrar.match.sets : null} onBack={() => setRegistrar(null)} onSave={saveResult} />}
        {ficha && <AlunoDetailScreen aluno={ficha} onBack={() => setFicha(null)} onShare={a => setShare({ type: 'aluno', aluno: a })} />}
        {partida && <PartidaDetailScreen match={partida} onBack={() => setPartida(null)} openAluno={setFicha} onDelete={deletePartida} onToast={showToast} onShare={m => setShare({ type: 'match', match: m })} onVerAvaliacoes={m => setSessao(m)} onEdit={m => setRegistrar({ mode: 'edit', match: m })} />}
        {sessao && <AvaliacoesScreen match={sessao} onBack={() => setSessao(null)} aval={sessAval} onAvaliar={a => setAvaliar(a.id)} onCompletar={completarAval} />}
        {avaliar && (() => { const a = ER.alunos.find(x => x.id === avaliar); const hasNext = presentIds.some(id => id !== avaliar && !sessAval[id]); return <AvaliarAlunoScreen key={avaliar} aluno={a} ctxLabel={'Treino de ' + (sessao ? sessao.dataFull : 'hoje') + ' · ' + (sessao ? sessao.turma : '')} initial={sessAval[avaliar]} hasNext={hasNext} onSave={saveAval} onBack={() => setAvaliar(null)} />; })()}
        {share && <ShareScreen subject={share} onBack={() => setShare(null)} onToast={showToast} />}
        {toast && (
          <div style={{ position: 'absolute', bottom: 96, left: 18, right: 18, background: 'var(--ink-800)', color: '#fff', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 50, boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            <Icon name="check-circle-2" size={20} color="var(--green-400)" />{toast}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- viewport scaling ---- */
function fitPhone() {
  const phone = document.getElementById('erPhone');
  if (!phone) return;
  const pad = 24;
  const s = Math.min((window.innerWidth - pad) / 390, (window.innerHeight - pad) / 844, 1);
  phone.style.transform = 'scale(' + s + ')';
  phone.style.transformOrigin = 'center center';
}
window.addEventListener('resize', fitPhone);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
setTimeout(fitPhone, 60);
