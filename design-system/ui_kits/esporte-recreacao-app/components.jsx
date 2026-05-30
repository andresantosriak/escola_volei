/* Esporte Recreação — UI components. Exports to window. */
const { useState, useEffect, useRef } = React;

/* ---------- Icon (lucide, injected imperatively) ---------- */
function Icon({ name, size = 20, color, strokeWidth = 2, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    el.appendChild(i);
    if (window.lucide) window.lucide.createIcons();
    const svg = el.querySelector('svg');
    if (svg) { svg.style.width = size + 'px'; svg.style.height = size + 'px'; svg.setAttribute('stroke-width', strokeWidth); }
  }, [name, size, strokeWidth]);
  return <span className="ic" ref={ref} style={{ color, width: size, height: size, ...style }}></span>;
}

/* ---------- Avatar ---------- */
function Avatar({ nome, size = 38, foto, ring }) {
  const [bg, fg] = ER.avatarColor(nome);
  const fontSize = Math.round(size * 0.38);
  return (
    <div className="er-av" style={{ width: size, height: size, background: bg, color: fg, fontSize, boxShadow: ring ? '0 0 0 2px ' + ring : undefined }}>
      {ER.initials(nome)}
    </div>
  );
}

/* ---------- Chip ---------- */
function Chip({ aluno, selected, onClick, showPos }) {
  return (
    <span className={'er-chip' + (selected ? ' sel' : '')} onClick={onClick}>
      <Avatar nome={aluno.nome} size={32} />
      {aluno.nome.split(' ')[0]}
      {showPos && <span className="pos">{aluno.pos}</span>}
    </span>
  );
}

/* ---------- Button ---------- */
function Button({ children, variant = 'primary', size = 'md', full, icon, onClick, disabled, type }) {
  return (
    <button type={type || 'button'} className={`er-btn ${variant} sz-${size}${full ? ' full' : ''}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={size === 'lg' ? 22 : 19} />}
      {children}
    </button>
  );
}

/* ---------- StatBadge ---------- */
function StatBadge({ n, label, tone = 'neutral', icon }) {
  return (
    <span className={'er-badge ' + tone}>
      {icon && <Icon name={icon} size={16} />}
      <span className="n">{n}</span>
      {label && <span className="sm">{label}</span>}
    </span>
  );
}

/* ---------- PresencaToggle ---------- */
const PRES = [
  { v: 'presente', cls: 'on-p', icon: 'check', label: 'Presente' },
  { v: 'falta', cls: 'on-l', icon: 'x', label: 'Falta' },
  { v: 'atraso', cls: 'on-a', icon: 'clock', label: 'Atraso' },
];
function PresencaToggle({ value, onChange, compact }) {
  return (
    <div className="er-seg">
      {PRES.map(o => (
        <button key={o.v} className={'opt' + (value === o.v ? ' ' + o.cls : '')} onClick={() => onChange(o.v)}>
          {value === o.v && <Icon name={o.icon} size={15} />}
          {compact ? (value === o.v ? o.label : o.label[0]) : o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Stepper ---------- */
function Stepper({ value, onChange, min = 1, max = 5 }) {
  return (
    <div className="er-stepper">
      <button className="rnd" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Icon name="minus" size={20} /></button>
      <span className="val">{value}</span>
      <button className="rnd" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Icon name="plus" size={20} /></button>
    </div>
  );
}

/* ---------- Scale 1-5 ---------- */
function Scale5({ value, onChange }) {
  return (
    <div className="er-scale">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} className={'s' + (value === n ? ' on' : '')} onClick={() => onChange(n)}>{n}</button>
      ))}
    </div>
  );
}

/* ---------- BalanceIndicator ---------- */
function BalanceIndicator({ score, mode, mixed, tiers, levOk, levTotal }) {
  const dev = mode === 'Desenvolvimento';
  // in Dev, 100% isn't the goal — mixing is; treat ~80+ as good, show criterion
  const good = dev ? mixed : score >= 80;
  const color = good ? 'var(--bal-500)' : 'var(--warn-500)';
  let title, hint;
  if (dev) {
    title = mixed ? 'Times mistos por nível' : 'Mistura incompleta';
    hint = mixed
      ? 'Cada time tem mentor + aprendiz (topo e base). O placar pode não ser exato — é esperado neste modo.'
      : 'Não deu pra misturar os níveis com os presentes de hoje. Ajuste na mão se quiser.';
  } else {
    title = good ? 'Times equilibrados' : 'Pode melhorar';
    hint = good
      ? 'Força total e cada fundamento divididos de forma parelha.'
      : 'Um time concentra os melhores. Toque em "Reequilibrar" ou arraste um aluno.';
  }
  return (
    <div className="er-balance">
      <div className="top">
        <span className="ttl"><Icon name={dev ? 'blend' : (good ? 'scale' : 'alert-triangle')} size={18} color={color} />{title}</span>
        <span className="pct" style={{ color }}>{score}%</span>
      </div>
      <div className="bar"><div className="fill" style={{ width: score + '%', background: color }}></div></div>
      {dev && tiers && (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0 0' }}>
          {[['t1', 'Time A'], ['t2', 'Time B']].map(([k, lbl]) => (
            <div key={k} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-sunken)', borderRadius: 9, padding: '6px 9px' }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--fg-3)' }}>{lbl}</span>
              <span style={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
                {['topo', 'meio', 'base'].map(t => (
                  <span key={t} title={t} style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: t === 'topo' ? 'var(--green-600)' : t === 'meio' ? 'var(--gray-400)' : 'var(--ink-600)', borderRadius: 5, padding: '2px 5px', opacity: tiers[k][t] ? 1 : .25 }}>{tiers[k][t]}{t[0].toUpperCase()}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="hint">{hint}</p>
      {levOk === false && (
        <p className="hint" style={{ color: 'var(--warn-700)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <Icon name="alert-triangle" size={13} color="var(--warn-500)" />
          {levTotal === 0 ? 'Nenhum levantador presente — defina os times na mão.' : 'Um time ficou sem levantador. Ajuste se possível.'}
        </p>
      )}
    </div>
  );
}

/* ---------- TeamPanel ---------- */
function TeamPanel({ side, name, onRename, team, onPlayerTap }) {
  const stats = ER.teamStats(team);
  const totalGeral = Math.round(team.reduce((a, p) => a + p.geral, 0) / (team.length || 1));
  const hasLev = team.some(p => p.pos === 'LEV');
  return (
    <div className={'er-team ' + side}>
      <div className="thd">
        <Icon name={side === 'A' ? 'flame' : 'anchor'} size={18} />
        <input value={name} onChange={e => onRename(e.target.value)} spellCheck={false} />
      </div>
      <div className="troster">
        {team.map(p => (
          <div className="er-prow" key={p.id} onClick={() => onPlayerTap(p)}>
            <Avatar nome={p.nome} size={28} />
            <span className="pn">{p.nome.split(' ')[0]}</span>
            {p.pos === 'LEV' && <span className="pos" style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-700)', background: 'var(--yellow-400)', padding: '1px 5px', borderRadius: 999 }}>LEV</span>}
            <span className="pg">{p.geral}</span>
          </div>
        ))}
      </div>
      <div className="tfoot">
        <span className="er-minibadge">Geral <b>{totalGeral}</b></span>
        <span className="er-minibadge">{team.length} jog.</span>
        <span className="er-minibadge" style={hasLev ? {} : { color: 'var(--loss-500)' }}>{hasLev ? 'Lev ✓' : 'Sem lev'}</span>
      </div>
    </div>
  );
}

/* ---------- ResultCard ---------- */
function ResultCard({ match, onClick }) {
  const sets = match.sets.map(s => s[0] + '–' + s[1]).join(' · ');
  const aWin = match.vencedor === 'a', bWin = match.vencedor === 'b';
  const setsA = match.sets.filter(s => s[0] > s[1]).length;
  const setsB = match.sets.filter(s => s[1] > s[0]).length;
  return (
    <div className="er-result" onClick={onClick}>
      <div className="date"><Icon name="calendar" size={14} />{match.dataFull}</div>
      <div className="match">
        <div className="team">
          <span className={'tn' + (aWin ? ' win' : '')}>{aWin && <Icon name="trophy" size={16} color="var(--yellow-500)" />}{match.a.nome}</span>
          <div className="roster">{match.a.elenco.slice(0, 3).map(n => n.split(' ')[0]).join(', ')} +{match.a.elenco.length - 3}</div>
        </div>
        <div className="score"><span className={aWin ? 'win' : ''} style={aWin ? { color: 'var(--win-700)' } : {}}>{setsA}</span><span className="x">×</span><span style={bWin ? { color: 'var(--win-700)' } : {}}>{setsB}</span></div>
        <div className="team b">
          <span className={'tn' + (bWin ? ' win' : '')}>{bWin && <Icon name="trophy" size={16} color="var(--yellow-500)" />}{match.b.nome}</span>
          <div className="roster">{match.b.elenco.slice(0, 3).map(n => n.split(' ')[0]).join(', ')} +{match.b.elenco.length - 3}</div>
        </div>
      </div>
      <p className="sets">{sets}</p>
    </div>
  );
}

/* ---------- PlayerCard (premium) ---------- */
function PlayerCard({ aluno }) {
  const [bg] = ER.avatarColor(aluno.nome);
  const order = ['saque', 'ataque', 'recepcao', 'levantamento', 'bloqueio', 'defesa'];
  const abbr = { saque: 'Saq', ataque: 'Atq', recepcao: 'Rec', levantamento: 'Lev', bloqueio: 'Blo', defesa: 'Def' };
  return (
    <div className="er-pcard">
      <div className="sheen"></div>
      <div className="hd">
        <div className="rate"><span className="n">{aluno.geral}</span><span className="l">GERAL</span></div>
        <span className="pos">{aluno.posLabel.toUpperCase()}</span>
      </div>
      <div className="pav" style={{ background: 'radial-gradient(circle at 50% 35%, #1BAE57, ' + bg + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-num)', fontWeight: 900, fontSize: 38, color: '#fff' }}>{ER.initials(aluno.nome)}</div>
      <div className="nm">{aluno.nome}</div>
      <div className="meta">{aluno.idade} anos · {(aluno.altura / 100).toFixed(2).replace('.', ',')} m · {aluno.mao.toLowerCase()} · {aluno.vitorias}V {aluno.derrotas}D</div>
      <div className="attrs">
        {order.map(k => (
          <div className="at" key={k}>
            <span className="k">{abbr[k]}</span>
            <span className="bar"><i style={{ width: (aluno.fundamentos[k] / 5 * 100) + '%' }}></i></span>
            <span className="v">{aluno.fundamentos[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- BottomNav ---------- */
const NAV = [
  { k: 'inicio', icon: 'house', label: 'Início' },
  { k: 'historico', icon: 'history', label: 'Histórico' },
  { k: 'alunos', icon: 'users', label: 'Alunos' },
  { k: 'menu', icon: 'menu', label: 'Menu' },
];
function BottomNav({ tab, onTab }) {
  return (
    <nav className="er-nav">
      {NAV.map(t => (
        <button key={t.k} className={'tab' + (tab === t.k ? ' on' : '')} onClick={() => onTab(t.k)}>
          <Icon name={t.icon} size={23} strokeWidth={tab === t.k ? 2.4 : 2} />
          {t.label}
        </button>
      ))}
    </nav>
  );
}

/* ---------- Header ---------- */
function Header({ title, sub, onBack, right }) {
  return (
    <div className="er-header">
      {onBack && <button className="er-iconbtn" onClick={onBack}><Icon name="chevron-left" size={22} /></button>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="h-title">{title}</div>
        {sub && <div className="h-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------- StatusBar ---------- */
function StatusBar({ dark }) {
  return (
    <div className={'er-statusbar' + (dark ? ' on-dark' : '')}>
      <span>9:41</span>
      <span className="sb-r"><Icon name="signal" size={16} /><Icon name="wifi" size={16} /><Icon name="battery-full" size={18} /></span>
    </div>
  );
}

/* ---------- EmptyState ---------- */
function EmptyState({ icon, title, desc, cta, onCta }) {
  return (
    <div className="er-empty">
      <div className="ei"><Icon name={icon} size={30} /></div>
      <div className="et">{title}</div>
      <div className="ed">{desc}</div>
      {cta && <Button icon="plus" onClick={onCta}>{cta}</Button>}
    </div>
  );
}

/* ---------- Sheet ---------- */
function Sheet({ title, onClose, children }) {
  return (
    <div className="er-scrim" onClick={onClose}>
      <div className="er-sheet" onClick={e => e.stopPropagation()}>
        <div className="grab"></div>
        {title && <h3 className="sh-title">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/* ---------- form primitives ---------- */
function Field({ label, value, type = 'text', options, area, placeholder }) {
  const norm = x => (typeof x === 'string' && x.normalize) ? x.normalize('NFC') : x;
  const [v, setV] = useState(norm(value || ''));
  if (options) {
    return (
      <div className="er-field">
        <label>{label}</label>
        <select className="er-input" value={v} onChange={e => setV(e.target.value)}>
          {options.map(o => <option key={o} value={norm(o)}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="er-field">
      <label>{label}</label>
      {area
        ? <textarea className="er-input area" rows={3} value={v} placeholder={placeholder} onChange={e => setV(e.target.value)} />
        : <input className="er-input" type={type} value={v} placeholder={placeholder} onChange={e => setV(e.target.value)} />}
    </div>
  );
}

function ToggleSwitch({ on, onChange }) {
  return <button className={'er-switch' + (on ? ' on' : '')} onClick={() => onChange(!on)} aria-pressed={on}></button>;
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="er-tabs">
      {tabs.map(t => <button key={t} className={'tb' + (active === t ? ' on' : '')} onClick={() => onChange(t)}>{t}</button>)}
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="er-segm">
      {options.map(o => <button key={o} className={value === o ? 'on' : ''} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  );
}

const NIVEL_CLS = { 'Iniciante': 'ini', 'Intermediário': 'int', 'Avançado': 'avc' };
function NivelTag({ nivel }) {
  return <span className={'er-tag ' + (NIVEL_CLS[nivel] || 'ini')}>{nivel}</span>;
}

/* position picker — principal (single) + alternativas (multi) */
function PositionField({ principal: p0, alternativas: a0 }) {
  const POS = ER.POS;
  const keys = Object.keys(POS);
  const [principal, setPrincipal] = useState(p0);
  const [alt, setAlt] = useState(a0 || []);
  const toggleAlt = k => setAlt(a => a.includes(k) ? a.filter(x => x !== k) : [...a, k]);
  return (
    <div className="er-field">
      <label>Posição principal</label>
      <div className="er-chipgrid">
        {keys.map(k => (
          <button key={k} className="er-poschip" data-on={principal === k} onClick={() => { setPrincipal(k); setAlt(a => a.filter(x => x !== k)); }}>
            <b>{k}</b>{POS[k]}
          </button>
        ))}
      </div>
      <label style={{ marginTop: 14 }}>Também joga como · opcional</label>
      <div className="er-chipgrid">
        {keys.filter(k => k !== principal).map(k => (
          <button key={k} className="er-poschip alt" data-on={alt.includes(k)} onClick={() => toggleAlt(k)}>
            <b>{k}</b>{POS[k]}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--fg-4)', margin: '10px 2px 0', lineHeight: 1.4 }}>A principal vira a <b>tag</b> no card e nos times, e ajuda o balanceador a não deixar um time sem levantador. <i>Não confundir com o fundamento "Levantamento".</i></p>
    </div>
  );
}

Object.assign(window, {
  Icon, Avatar, Chip, Button, StatBadge, PresencaToggle, Stepper, Scale5,
  BalanceIndicator, TeamPanel, ResultCard, PlayerCard, BottomNav, Header,
  StatusBar, EmptyState, Sheet, Field, ToggleSwitch, Tabs, Segmented, NivelTag, PositionField,
});
