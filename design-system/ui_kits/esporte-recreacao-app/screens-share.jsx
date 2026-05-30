/* Esporte Recreação — Share image generator + Session evaluations. */

/* ============ SHARE CARD (reusable: match result OR player card) ============ */
const SHARE_THEMES = {
  Verde: 'radial-gradient(120% 90% at 80% 0%, #009C3B 0%, #07204F 48%, #03112E 100%)',
  Escuro: 'linear-gradient(160deg, #0F2A6B, #03112E)',
  Claro: 'linear-gradient(160deg, #FFFFFF, #EAEEF5)',
};
function ShareCard({ subject, format, opts, theme }) {
  const dims = { quadrado: [300, 300], vertical: [300, 533], paisagem: [340, 191] }[format];
  const light = theme === 'Claro';
  const fg = light ? '#10131C' : '#fff';
  const sub = light ? 'rgba(16,19,28,.55)' : 'rgba(255,255,255,.62)';
  const base = {
    width: dims[0], height: dims[1], borderRadius: 22, padding: format === 'paisagem' ? 16 : 22,
    background: SHARE_THEMES[theme], color: fg, position: 'relative', overflow: 'hidden',
    boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column',
  };

  if (subject.type === 'aluno') {
    return <div style={{ ...base, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: format === 'vertical' ? 260 : 230 }}><PlayerCard aluno={subject.aluno} /></div>
    </div>;
  }

  const m = subject.match;
  const setsA = m.sets.filter(s => s[0] > s[1]).length, setsB = m.sets.filter(s => s[1] > s[0]).length;
  const aWin = m.vencedor === 'a';
  return (
    <div style={base}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,.08), transparent 42%)', pointerEvents: 'none' }}></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        <img src="assets/logo-mark.svg" width="22" height="22" alt="" style={light ? { filter: 'none' } : {}} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.04em', lineHeight: 1, color: fg }}>Esporte<br />Recreação</span>
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: sub, fontWeight: 600, textAlign: 'right' }}>{m.dataFull}<br />{m.turma}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6, position: 'relative', padding: '8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: format === 'paisagem' ? 14 : 18 }}>
          <div style={{ textAlign: 'center', maxWidth: 100 }}>
            {aWin && <Icon name="trophy" size={18} color="#FFCB00" />}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: aWin ? '#FFCB00' : fg }}>{m.a.nome}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: format === 'paisagem' ? 34 : 44, letterSpacing: '-.03em', color: fg, whiteSpace: 'nowrap' }}>{setsA} <span style={{ color: sub, fontSize: '.6em' }}>×</span> {setsB}</div>
          <div style={{ textAlign: 'center', maxWidth: 100 }}>
            {!aWin && <Icon name="trophy" size={18} color="#FFCB00" />}
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: !aWin ? '#FFCB00' : fg }}>{m.b.nome}</div>
          </div>
        </div>
        {opts.sets && <div style={{ fontSize: 11, color: sub, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{m.sets.map(s => s[0] + '–' + s[1]).join('  ·  ')}</div>}
        {opts.equilibrio && m.equilibrio && (
          <div style={{ marginTop: 4, fontSize: 10.5, fontWeight: 700, color: '#0B0F1F', background: '#FFCB00', padding: '3px 10px', borderRadius: 999 }}>Jogo equilibrado: {m.equilibrio}%</div>
        )}
      </div>

      {opts.elencos && format !== 'paisagem' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 9.5, color: sub, position: 'relative', lineHeight: 1.5, borderTop: '1px solid ' + (light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.14)'), paddingTop: 10 }}>
          <div>{m.a.elenco.map(n => <div key={n}>{n.split(' ')[0]} {n.split(' ')[1] ? n.split(' ')[1][0] + '.' : ''}</div>)}</div>
          <div style={{ textAlign: 'right' }}>{m.b.elenco.map(n => <div key={n}>{n.split(' ')[0]} {n.split(' ')[1] ? n.split(' ')[1][0] + '.' : ''}</div>)}</div>
        </div>
      )}
    </div>
  );
}

function ShareScreen({ subject, onBack, onToast }) {
  const isAluno = subject.type === 'aluno';
  const [format, setFormat] = useState('quadrado');
  const [theme, setTheme] = useState('Verde');
  const [opts, setOpts] = useState({ elencos: true, sets: true, equilibrio: true });
  const [loading, setLoading] = useState(false);
  const toggle = k => setOpts(o => ({ ...o, [k]: !o[k] }));

  function generate(then) {
    setLoading(true);
    setTimeout(() => { setLoading(false); onToast(then); }, 1100);
  }

  const OptRow = ({ k, label }) => (
    <div className="er-srow" style={{ background: 'transparent' }}>
      <div className="sb"><div className="st" style={{ fontSize: 14 }}>{label}</div></div>
      <ToggleSwitch on={opts[k]} onChange={() => toggle(k)} />
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 38, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <Header title="Compartilhar" onBack={onBack} />
      <div className="er-screen">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 18px 18px', minHeight: 320, alignItems: 'center', background: 'var(--bg-sunken)' }}>
          <ShareCard subject={subject} format={format} opts={opts} theme={theme} />
        </div>
        <div className="er-body" style={{ paddingTop: 6, paddingBottom: 150 }}>
          <div className="er-grouplabel">Formato</div>
          <Segmented options={['quadrado', 'vertical', 'paisagem']} value={format} onChange={setFormat} />
          {!isAluno && (
            <>
              <div className="er-grouplabel">O que incluir</div>
              <div className="er-group" style={{ padding: '4px 6px' }}>
                <OptRow k="elencos" label="Elencos" />
                <OptRow k="sets" label="Placar set a set" />
                <OptRow k="equilibrio" label="Índice de equilíbrio" />
              </div>
            </>
          )}
          <div className="er-grouplabel">Tema</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Object.keys(SHARE_THEMES).map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, height: 44, borderRadius: 12, cursor: 'pointer', border: '2px solid ' + (theme === t ? 'var(--green-500)' : 'transparent'), background: SHARE_THEMES[t], color: t === 'Claro' ? '#10131C' : '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="er-dock">
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" full icon="download" onClick={() => generate('Imagem salva na galeria')}>Salvar</Button>
          <Button full icon="share-2" onClick={() => generate('Pronto para compartilhar')}>Compartilhar</Button>
        </div>
      </div>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,17,46,.55)', zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#fff' }}>
          <div className="er-spin"></div>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Gerando imagem…</span>
        </div>
      )}
    </div>
  );
}

/* ============ AVALIAÇÕES DO TREINO (session) ============ */
function AvaliacoesScreen({ match, onBack, aval, onAvaliar, onCompletar }) {
  const byName = n => ER.alunos.find(a => a.nome === n);
  const presentes = [...new Set([...match.a.elenco, ...match.b.elenco])].map(byName).filter(Boolean);
  const fundLabel = { saque: 'Saque', recepcao: 'Recepção', levantamento: 'Levant.', ataque: 'Ataque', bloqueio: 'Bloqueio', defesa: 'Defesa' };
  const avaliados = presentes.filter(p => aval[p.id]).length;
  const ajustes = presentes.reduce((s, p) => s + (aval[p.id] ? aval[p.id].ajustes.length : 0), 0);
  const aWin = match.vencedor === 'a';

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 38, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <Header title="Avaliações" sub={'Treino de ' + match.dataFull + ' · ' + match.turma} onBack={onBack} />
      <div className="er-screen">
        <div className="er-body" style={{ paddingTop: 4 }}>
          {/* match context */}
          <div className="er-card" style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--green-50)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="volleyball" size={20} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--fg-1)' }}>{match.a.nome} <span style={{ color: 'var(--fg-4)' }}>×</span> {match.b.nome}</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-4)' }}>Partida do dia · vencedor {aWin ? match.a.nome : match.b.nome}</div>
            </div>
            <button className="er-btn ghost sz-md" style={{ height: 36, padding: '0 12px', fontSize: 13 }} onClick={onBack}>Ver partida</button>
          </div>

          {/* stats band */}
          <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
            <StatBadge n={presentes.length} label="presentes" tone="neutral" icon="user-check" />
            <StatBadge n={avaliados} label="avaliados" tone="win" />
            <StatBadge n={ajustes} label="ajustes" tone="blue" icon="trending-up" />
          </div>

          {/* clarification */}
          <p style={{ fontSize: 11.5, color: 'var(--fg-4)', margin: '14px 2px 0', lineHeight: 1.45 }}>As notas são do <b>treino</b>, não da partida. Uma partida gera apenas a vitória/derrota do time.</p>

          {avaliados === 0 ? (
            <EmptyState icon="clipboard-list" title="Ninguém avaliado neste treino" desc="Registre o engajamento e os ajustes de fundamento dos presentes." cta="Avaliar treino" onCta={onCompletar} />
          ) : (
            <>
              <div className="er-sect"><span className="t">Presentes</span></div>
              <div className="er-list">
                {presentes.map(p => {
                  const av = aval[p.id];
                  return (
                    <div className="er-callrow" key={p.id} onClick={() => onAvaliar(p)} style={{ cursor: 'pointer', alignItems: av && av.ajustes.length ? 'flex-start' : 'center' }}>
                      <Avatar nome={p.nome} size={40} />
                      <div className="cn">
                        <div className="nm">{p.nome.split(' ')[0]} {p.nome.split(' ')[1] || ''}</div>
                        {av ? (
                          av.ajustes.length > 0 ? (
                            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                              {av.ajustes.map(([f, dir], i) => (
                                <span key={i} style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: dir === 'up' ? 'var(--win-bg)' : 'var(--loss-bg)', color: dir === 'up' ? 'var(--win-700)' : 'var(--loss-700)' }}>{dir === 'up' ? '↑' : '↓'} {fundLabel[f]}</span>
                              ))}
                            </div>
                          ) : <div className="mt">Sem ajustes de nível</div>
                        ) : <div className="mt" style={{ color: 'var(--warn-700)' }}>Presente · não avaliado</div>}
                      </div>
                      {av
                        ? <span className="er-badge neutral" style={{ padding: '6px 10px', flexDirection: 'column', gap: 0, lineHeight: 1 }}><span className="n" style={{ fontSize: 18, color: 'var(--green-600)' }}>{av.engajamento}</span><span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-4)' }}>ENGAJ.</span></span>
                        : <button className="er-btn secondary sz-md" style={{ height: 38, padding: '0 14px', fontSize: 13 }} onClick={e => { e.stopPropagation(); onAvaliar(p); }}>Avaliar</button>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="er-dock">
        <Button size="lg" full icon="clipboard-check" onClick={onCompletar}>Completar avaliações</Button>
      </div>
    </div>
  );
}

Object.assign(window, { ShareCard, ShareScreen, AvaliacoesScreen });

/* ============ REGISTRAR RESULTADO (score entry) ============ */
function ScoreStep({ value, onChange, win }) {
  return (
    <div className={'er-score-step' + (win ? ' win' : '')}>
      <button onClick={() => onChange(Math.max(0, value - 1))}><Icon name="minus" size={16} /></button>
      <input type="number" inputMode="numeric" value={value} onChange={e => onChange(Math.max(0, parseInt(e.target.value || '0', 10)))} />
      <button onClick={() => onChange(value + 1)}><Icon name="plus" size={16} /></button>
    </div>
  );
}

const FORMATOS = { 'Set único': 1, 'Melhor de 3': 3, 'Melhor de 5': 5, 'Por tempo': 1 };
function RegistrarResultadoScreen({ mode, nameA: nA0, nameB: nB0, initialSets, onBack, onSave }) {
  const [nameA, setNameA] = useState(nA0);
  const [nameB, setNameB] = useState(nB0);
  const [sets, setSets] = useState(initialSets && initialSets.length ? initialSets.map(s => [s[0], s[1]]) : [[0, 0], [0, 0], [0, 0]]);
  const [formato, setFormato] = useState('Melhor de 3');
  const [manual, setManual] = useState('Automático');

  const setScore = (i, side, v) => setSets(ss => ss.map((s, j) => j === i ? (side === 0 ? [v, s[1]] : [s[0], v]) : s));
  const addSet = () => setSets(ss => [...ss, [0, 0]]);
  const removeSet = i => setSets(ss => ss.length > 1 ? ss.filter((_, j) => j !== i) : ss);
  const changeFormato = f => { setFormato(f); const n = FORMATOS[f]; setSets(ss => { const arr = ss.slice(0, n); while (arr.length < n) arr.push([0, 0]); return arr; }); };

  const played = sets.filter(s => s[0] !== 0 || s[1] !== 0);
  const setsA = played.filter(s => s[0] > s[1]).length;
  const setsB = played.filter(s => s[1] > s[0]).length;
  const tie = sets.some(s => (s[0] !== 0 || s[1] !== 0) && s[0] === s[1]);
  const autoVenc = setsA > setsB ? 'a' : setsB > setsA ? 'b' : null;
  let vencedor = autoVenc, wo = false;
  if (manual === nameA) vencedor = 'a';
  else if (manual === nameB) vencedor = 'b';
  else if (manual === 'W.O. A') { vencedor = 'a'; wo = true; }
  else if (manual === 'W.O. B') { vencedor = 'b'; wo = true; }
  const canSave = (played.length > 0 || wo) && vencedor;

  const doSave = another => onSave({ sets: played.length ? played : [[0, 0]], nameA, nameB, vencedor, wo, another });

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 40, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <Header title={mode === 'edit' ? 'Editar resultado' : 'Registrar resultado'} onBack={onBack} />
      <div className="er-screen">
        <div style={{ padding: '0 18px' }}>
          <div className="er-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <input value={nameA} onChange={e => setNameA(e.target.value)} spellCheck={false} style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: vencedor === 'a' ? 'var(--win-700)' : 'var(--fg-1)', borderBottom: '1.5px dashed var(--border-2)', padding: '2px 0' }} />
            <div style={{ fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: 30, letterSpacing: '-.02em', padding: '0 12px', whiteSpace: 'nowrap' }}><span style={vencedor === 'a' ? { color: 'var(--win-700)' } : {}}>{setsA}</span><span style={{ color: 'var(--fg-4)', fontSize: 18 }}> × </span><span style={vencedor === 'b' ? { color: 'var(--win-700)' } : {}}>{setsB}</span></div>
            <input value={nameB} onChange={e => setNameB(e.target.value)} spellCheck={false} style={{ flex: 1, minWidth: 0, textAlign: 'right', border: 0, background: 'transparent', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: vencedor === 'b' ? 'var(--win-700)' : 'var(--fg-1)', borderBottom: '1.5px dashed var(--border-2)', padding: '2px 0' }} />
          </div>
        </div>

        <div className="er-body" style={{ paddingTop: 8, paddingBottom: 160 }}>
          <div className="er-grouplabel">Formato</div>
          <Segmented options={['Set único', 'Melhor de 3', 'Melhor de 5', 'Por tempo']} value={formato} onChange={changeFormato} />

          <div className="er-grouplabel">Placar por set</div>
          <div className="er-card" style={{ padding: '6px 14px' }}>
            {sets.map((s, i) => {
              const aw = (s[0] !== 0 || s[1] !== 0) && s[0] > s[1];
              const bw = (s[0] !== 0 || s[1] !== 0) && s[1] > s[0];
              return (
                <div className="er-setrow" key={i} style={i ? { borderTop: '1px solid var(--border-1)' } : {}}>
                  <span className="sn">SET {i + 1}</span>
                  <ScoreStep value={s[0]} win={aw} onChange={v => setScore(i, 0, v)} />
                  <span style={{ color: 'var(--fg-4)', fontWeight: 600 }}>×</span>
                  <ScoreStep value={s[1]} win={bw} onChange={v => setScore(i, 1, v)} />
                  <button className="er-iconbtn" style={{ width: 34, height: 34, marginLeft: 'auto', boxShadow: 'none', background: 'transparent', color: 'var(--fg-4)' }} onClick={() => removeSet(i)}><Icon name="x" size={18} /></button>
                </div>
              );
            })}
          </div>
          {tie && <p style={{ fontSize: 11.5, color: 'var(--warn-700)', margin: '8px 2px 0', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="alert-triangle" size={14} color="var(--warn-500)" />Há um set empatado — defina o vencedor abaixo.</p>}
          <button className="er-btn ghost sz-md full" style={{ marginTop: 10 }} onClick={addSet}><Icon name="plus" size={18} />Adicionar set</button>

          <div className="er-grouplabel">Vencedor</div>
          <div className="er-chipgrid">
            {['Automático', nameA, nameB, 'W.O. A', 'W.O. B'].map(opt => (
              <button key={opt} onClick={() => setManual(opt)} style={{ border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, padding: '8px 14px', borderRadius: 999, background: manual === opt ? 'var(--green-500)' : 'var(--bg-surface)', color: manual === opt ? '#fff' : 'var(--fg-2)', boxShadow: manual === opt ? 'none' : 'var(--shadow-sm)' }}>{opt}</button>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--fg-4)', margin: '10px 2px 0' }}>{wo ? 'Vitória por W.O. (sem placar completo).' : autoVenc ? 'Vencedor calculado pelos sets ganhos — ajuste se precisar.' : 'Digite os sets ou escolha o vencedor manualmente.'}</p>
        </div>
      </div>

      <div className="er-dock">
        <Button size="lg" full icon="check" disabled={!canSave} onClick={() => doSave(false)}>{canSave ? 'Salvar resultado' : 'Defina o vencedor'}</Button>
        {mode !== 'edit' && <button className="er-btn ghost sz-md full" style={{ marginTop: 10 }} disabled={!canSave} onClick={() => doSave(true)}><Icon name="plus" size={18} />Salvar e registrar outra partida</button>}
      </div>
    </div>
  );
}

Object.assign(window, { RegistrarResultadoScreen });

/* ============ AVALIAR ALUNO (rapid evaluation, tela 6.4) ============ */
function AvaliarAlunoScreen({ aluno, ctxLabel, initial, hasNext, onSave, onBack }) {
  const tecnicos = ER.fundConfig.tecnicos.filter(f => f.ativo);
  const soft = ER.fundConfig.soft.filter(f => f.ativo);
  const origLevel = k => aluno.fundamentos[k] != null ? aluno.fundamentos[k] : 3;
  const [levels, setLevels] = useState(() => { const o = {}; tecnicos.forEach(f => o[f.key] = origLevel(f.key)); return o; });
  const [eng, setEng] = useState(initial ? initial.engajamento : 0);
  const [expand, setExpand] = useState(false);
  const [softVals, setSoftVals] = useState({});
  const [obs, setObs] = useState('');

  const setLevel = (k, v) => setLevels(l => ({ ...l, [k]: v }));
  const changed = k => levels[k] !== origLevel(k);

  function save(next) {
    const ajustes = tecnicos.filter(f => aluno.fundamentos[f.key] != null && changed(f.key))
      .map(f => [f.key, levels[f.key] > origLevel(f.key) ? 'up' : 'down']);
    onSave({ alunoId: aluno.id, engajamento: eng || null, ajustes }, next);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 42, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div className="er-header" style={{ paddingBottom: 12 }}>
        <button className="er-iconbtn" onClick={onBack}><Icon name="chevron-left" size={22} /></button>
        <Avatar nome={aluno.nome} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="h-title" style={{ fontSize: 19 }}>{aluno.nome.split(' ')[0]} {aluno.nome.split(' ')[1] || ''}</div>
          <div className="h-sub">{ctxLabel}</div>
        </div>
      </div>
      <div className="er-screen">
        <div className="er-body" style={{ paddingTop: 4, paddingBottom: 150 }}>
          {/* técnicos */}
          <div className="er-grouplabel" style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'none', letterSpacing: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-1)', fontFamily: 'var(--font-display)' }}>Fundamentos técnicos</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-4)' }}>ajuste de nível · estável</span>
          </div>
          <div className="er-card" style={{ padding: '4px 14px' }}>
            {tecnicos.map((f, i) => (
              <div key={f.key} style={i ? { borderTop: '1px solid var(--border-1)', padding: '11px 0' } : { padding: '11px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)' }}>{f.label}</span>
                  {changed(f.key) && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: levels[f.key] > origLevel(f.key) ? 'var(--win-bg)' : 'var(--loss-bg)', color: levels[f.key] > origLevel(f.key) ? 'var(--win-700)' : 'var(--loss-700)' }}>{levels[f.key] > origLevel(f.key) ? '↑' : '↓'} de {origLevel(f.key)}</span>}
                </div>
                <Scale5 value={levels[f.key]} onChange={v => setLevel(f.key, v)} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--fg-4)', margin: '8px 2px 0' }}>Padrão = sem alteração. Só o que você mexer vira ajuste — e alimenta o balanceamento dos times.</p>

          {/* engajamento */}
          <div className="er-grouplabel" style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'none', letterSpacing: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--fg-1)', fontFamily: 'var(--font-display)' }}>Engajamento do dia</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-4)' }}>volátil · vira o ENGAJ.</span>
          </div>
          <div className="er-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14.5 }}>Nota geral do dia</span>
              <button onClick={() => setExpand(e => !e)} style={{ border: 0, background: 'transparent', color: 'var(--green-600)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>{expand ? 'Recolher' : 'Detalhar'}<Icon name={expand ? 'chevron-up' : 'chevron-down'} size={15} /></button>
            </div>
            <Scale5 value={eng} onChange={setEng} />
            {expand && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border-1)', paddingTop: 12 }}>
                {soft.map(f => (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)' }}>{f.label}</span>
                    <Scale5 value={softVals[f.key] || 0} onChange={v => setSoftVals(s => ({ ...s, [f.key]: v }))} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* observação */}
          <div className="er-grouplabel">Observação do dia · opcional</div>
          <textarea className="er-input area" rows={2} value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex.: boa evolução na recepção hoje" />
        </div>
      </div>
      <div className="er-dock">
        {hasNext
          ? <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" full icon="check" onClick={() => save(false)}>Salvar</Button>
              <Button full icon="arrow-right" onClick={() => save(true)}>Salvar e próximo</Button>
            </div>
          : <Button size="lg" full icon="check" onClick={() => save(false)}>Salvar avaliação</Button>}
      </div>
    </div>
  );
}

Object.assign(window, { AvaliarAlunoScreen });
