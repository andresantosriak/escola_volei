/* Esporte Recreação — management screens (Filiais, Turmas, Aluno, Fundamentos, Config). */

/* ---------------- FILIAIS ---------------- */
function FiliaisScreen({ onBack, nav }) {
  const counts = f => {
    const ts = ER.turmas.filter(t => t.filialId === f.id);
    return { turmas: ts.length, alunos: ts.reduce((a, t) => a + t.n, 0) };
  };
  return (
    <>
      <Header title="Filiais" onBack={onBack} right={<button className="er-iconbtn" onClick={() => nav.push({ key: 'filialNew' })}><Icon name="plus" size={22} /></button>} />
      <div className="er-body" style={{ paddingTop: 4 }}>
        <div className="er-list">
          {ER.filiais.map(f => {
            const c = counts(f);
            return (
              <div className="er-mrow" key={f.id} onClick={() => nav.push({ key: 'filialDetail', id: f.id })}>
                <div className="micon"><Icon name="building-2" size={22} /></div>
                <div className="mbody">
                  <div className="mt">{f.nome}</div>
                  <div className="ms">{f.cidade} · {c.turmas} turmas · {c.alunos} alunos</div>
                </div>
                <Icon name="chevron-right" size={20} color="var(--fg-4)" />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="er-srow">
      <span className="si"><Icon name={icon} size={19} /></span>
      <div className="sb"><div className="ss" style={{ marginTop: 0 }}>{label}</div><div className="st" style={{ fontSize: 15, marginTop: 1 }}>{value || '—'}</div></div>
    </div>
  );
}

function FilialDetailScreen({ filial, mode = 'view', onBack, nav, onToast, onDelete }) {
  const isNew = mode === 'new';
  const [editing, setEditing] = useState(isNew);
  const [confirm, setConfirm] = useState(false);
  const turmas = isNew ? [] : ER.turmas.filter(t => t.filialId === filial.id);
  const f = filial || { nome: '', cidade: '', endereco: '', telefone: '', responsavel: '' };

  const save = () => { if (isNew) { onToast('Filial criada'); onBack(); } else { setEditing(false); onToast('Filial salva'); } };
  const right = editing
    ? <button className="er-iconbtn" style={{ width: 'auto', padding: '0 14px', color: 'var(--green-600)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }} onClick={save}>{isNew ? 'Salvar' : 'Salvar'}</button>
    : <button className="er-iconbtn" style={{ width: 'auto', padding: '0 14px', color: 'var(--green-600)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }} onClick={() => setEditing(true)}>Editar</button>;

  return (
    <>
      <Header title={isNew ? 'Nova filial' : f.nome} onBack={onBack} right={right} />
      <div className="er-body" style={{ paddingTop: 4 }}>
        {editing ? (
          <>
            <Field label="Nome da filial" value={f.nome} placeholder="Ex.: Unidade Centro" />
            <Field label="Cidade / região" value={f.cidade} placeholder="Ex.: São Paulo · Centro" />
            <Field label="Endereço · opcional" value={f.endereco} placeholder="Rua, número" />
            <div className="er-fieldrow">
              <Field label="Telefone · opcional" value={f.telefone} placeholder="(11) 0000-0000" />
              <Field label="Responsável · opcional" value={f.responsavel} placeholder="Nome" />
            </div>
          </>
        ) : (
          <div className="er-group">
            <InfoRow icon="building-2" label="Nome" value={f.nome} />
            <InfoRow icon="map-pin" label="Cidade / região" value={f.cidade} />
            <InfoRow icon="navigation" label="Endereço" value={f.endereco} />
            <InfoRow icon="phone" label="Telefone" value={f.telefone} />
            <InfoRow icon="user" label="Responsável" value={f.responsavel} />
          </div>
        )}

        {!isNew && (
          <>
            <div className="er-sect"><span className="t" style={{ whiteSpace: 'nowrap' }}>Turmas desta filial · {turmas.length}</span></div>
            {turmas.length === 0 ? (
              <EmptyState icon="users-round" title="Nenhuma turma nesta filial" desc="Crie a primeira turma para começar a usar esta unidade." cta="Adicionar primeira turma" onCta={() => nav.push({ key: 'turmaNew', filialId: f.id })} />
            ) : (
              <>
                <div className="er-list">
                  {turmas.map(t => (
                    <div className="er-mrow" key={t.id} onClick={() => nav.push({ key: 'turmaDetail', id: t.id })}>
                      <div className="micon"><Icon name="users-round" size={20} /></div>
                      <div className="mbody"><div className="mt" style={{ fontSize: 15 }}>{t.nome}</div><div className="ms">{t.dias} · {t.hora} · {t.n} alunos</div></div>
                      <Icon name="chevron-right" size={20} color="var(--fg-4)" />
                    </div>
                  ))}
                </div>
                <button className="er-btn secondary sz-md full" style={{ marginTop: 10 }} onClick={() => nav.push({ key: 'turmaNew', filialId: f.id })}><Icon name="plus" size={18} />Nova turma</button>
              </>
            )}

            <div className="er-sect"><span className="t">Ações</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="ghost" full icon="archive" onClick={() => onToast('Filial arquivada')}>Arquivar filial</Button>
              <button className="er-btn ghost sz-md full" style={{ color: turmas.length ? 'var(--fg-4)' : 'var(--loss-500)' }} onClick={() => turmas.length ? onToast('Mova ou arquive as turmas primeiro') : setConfirm(true)}><Icon name="trash-2" size={18} />Excluir filial</button>
            </div>
            {turmas.length > 0 && <p style={{ fontSize: 11.5, color: 'var(--fg-4)', margin: '10px 2px 0', display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icon name="lock" size={13} color="var(--fg-4)" />Filiais com turmas ativas não podem ser excluídas — arquive ou mova as turmas antes.</p>}
          </>
        )}
      </div>

      {confirm && (
        <Sheet title="Excluir filial?" onClose={() => setConfirm(false)}>
          <p style={{ margin: '0 0 18px', color: 'var(--fg-3)', fontSize: 13.5 }}>A unidade <b>{f.nome}</b> será removida. Esta ação não pode ser desfeita.</p>
          <button className="er-btn sz-lg full" style={{ background: 'var(--loss-500)', color: '#fff' }} onClick={() => { setConfirm(false); onDelete && onDelete(f.id); onBack(); }}><Icon name="trash-2" size={20} />Excluir filial</button>
          <button className="er-btn ghost sz-md full" style={{ marginTop: 10 }} onClick={() => setConfirm(false)}>Cancelar</button>
        </Sheet>
      )}
    </>
  );
}

/* ---------------- TURMAS ---------------- */
function TurmasScreen({ onBack, nav }) {
  const [filtro, setFiltro] = useState('Todas');
  const filiais = ['Todas', ...ER.filiais.map(f => f.nome)];
  const lista = filtro === 'Todas' ? ER.turmas : ER.turmas.filter(t => t.filial === filtro);
  return (
    <>
      <Header title="Turmas" onBack={onBack} right={<button className="er-iconbtn" onClick={() => nav.push({ key: 'turmaNew' })}><Icon name="plus" size={22} /></button>} />
      <div style={{ padding: '0 18px 2px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {filiais.map(f => (
          <span key={f} onClick={() => setFiltro(f)} style={{ flex: 'none', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 999, cursor: 'pointer', background: filtro === f ? 'var(--green-500)' : 'var(--bg-surface)', color: filtro === f ? '#fff' : 'var(--fg-2)', boxShadow: filtro === f ? 'none' : 'var(--shadow-sm)' }}>{f}</span>
        ))}
      </div>
      <div className="er-body" style={{ paddingTop: 14 }}>
        <div className="er-list">
          {lista.map(t => (
            <div className="er-mrow" key={t.id} onClick={() => nav.push({ key: 'turmaDetail', id: t.id })}>
              <div className="micon"><Icon name="users-round" size={22} /></div>
              <div className="mbody">
                <div className="mt" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{t.nome}</div>
                <div className="ms">{t.filial} · {t.dias} · {t.hora}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}><NivelTag nivel={t.nivel} /><span style={{ fontSize: 12, color: 'var(--fg-4)', fontWeight: 600 }}>{t.n} alunos</span></div>
              </div>
              <Icon name="chevron-right" size={20} color="var(--fg-4)" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TurmaDetailScreen({ turma, mode = 'view', filialId, onBack, nav, onIniciar, onToast, onDelete }) {
  const isNew = mode === 'new';
  const [editing, setEditing] = useState(isNew);
  const [confirm, setConfirm] = useState(false);
  const filialNome = filialId ? (ER.filiais.find(f => f.id === filialId) || {}).nome : '';
  const t = turma || { nome: '', filial: filialNome, dias: '', hora: '', nivel: 'Iniciante', faixa: '', professor: '' };
  const matriculados = isNew ? [] : (t.id === 't1' ? ER.alunos : ER.alunos.slice(0, Math.min(t.n, ER.alunos.length)));

  const save = () => { onToast(isNew ? 'Turma criada' : 'Turma salva'); if (isNew) onBack(); else setEditing(false); };
  const right = <button className="er-iconbtn" style={{ width: 'auto', padding: '0 14px', color: 'var(--green-600)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }} onClick={() => editing ? save() : setEditing(true)}>{editing ? 'Salvar' : 'Editar'}</button>;

  return (
    <>
      <Header title={isNew ? 'Nova turma' : t.nome} onBack={onBack} right={right} />
      <div className="er-body" style={{ paddingTop: 4 }}>
        {editing ? (
          <>
            <Field label="Nome da turma" value={t.nome} placeholder="Ex.: Sub-17 Masculino" />
            <Field label="Filial" value={t.filial} options={ER.filiais.map(f => f.nome)} />
            <div className="er-fieldrow">
              <Field label="Dias" value={t.dias} placeholder="Seg · Qua" />
              <Field label="Horário" value={t.hora} placeholder="18:30" />
            </div>
            <div className="er-fieldrow">
              <Field label="Nível" value={t.nivel} options={['Iniciante', 'Intermediário', 'Avançado']} />
              <Field label="Faixa etária" value={t.faixa} placeholder="15–17 anos" />
            </div>
            <Field label="Professor responsável" value={t.professor} placeholder="Nome" />
          </>
        ) : (
          <div className="er-group">
            <InfoRow icon="users-round" label="Turma" value={t.nome} />
            <InfoRow icon="building-2" label="Filial" value={t.filial} />
            <InfoRow icon="calendar" label="Dias e horário" value={t.dias + ' · ' + t.hora} />
            <InfoRow icon="bar-chart-3" label="Nível" value={t.nivel} />
            <InfoRow icon="cake" label="Faixa etária" value={t.faixa} />
            <InfoRow icon="user" label="Professor" value={t.professor} />
          </div>
        )}

        {!isNew && (
          <>
            <div className="er-sect"><span className="t">Alunos matriculados · {matriculados.length}</span><span className="a">+ Adicionar</span></div>
            {matriculados.length === 0 ? (
              <EmptyState icon="user-plus" title="Nenhum aluno na turma" desc="Adicione alunos para fazer a chamada e montar os times." cta="Adicionar aluno" onCta={() => onToast('Adicionar aluno')} />
            ) : (
              <div className="er-chipgrid">
                {matriculados.map(a => (
                  <span className="er-chip" key={a.id} onClick={() => nav.openAluno(a)}>
                    <Avatar nome={a.nome} size={32} />{a.nome.split(' ')[0]}
                    <Icon name="x" size={14} color="var(--fg-4)" />
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
              <Button full size="lg" icon="play" onClick={onIniciar}>Iniciar treino</Button>
              <Button variant="ghost" full icon="archive" onClick={() => onToast('Turma arquivada')}>Arquivar turma</Button>
              <button className="er-btn ghost sz-md full" style={{ color: 'var(--loss-500)' }} onClick={() => setConfirm(true)}><Icon name="trash-2" size={18} />Excluir turma</button>
            </div>
          </>
        )}
      </div>

      {confirm && (
        <Sheet title="Excluir turma?" onClose={() => setConfirm(false)}>
          <p style={{ margin: '0 0 18px', color: 'var(--fg-3)', fontSize: 13.5 }}>A turma <b>{t.nome}</b> e seus vínculos com alunos serão removidos. Esta ação não pode ser desfeita.</p>
          <button className="er-btn sz-lg full" style={{ background: 'var(--loss-500)', color: '#fff' }} onClick={() => { setConfirm(false); onDelete && onDelete(t.id); onBack(); }}><Icon name="trash-2" size={20} />Excluir turma</button>
          <button className="er-btn ghost sz-md full" style={{ marginTop: 10 }} onClick={() => setConfirm(false)}>Cancelar</button>
        </Sheet>
      )}
    </>
  );
}

/* ---------------- FUNDAMENTOS ---------------- */
function FundamentosScreen({ onBack }) {
  const [tec, setTec] = useState(ER.fundConfig.tecnicos.map(f => ({ ...f })));
  const [soft, setSoft] = useState(ER.fundConfig.soft.map(f => ({ ...f })));
  const [escala, setEscala] = useState('1 a 5');
  const [avancado, setAvancado] = useState(false);
  const toggle = (setFn) => (key) => setFn(arr => arr.map(f => f.key === key ? { ...f, ativo: !f.ativo } : f));

  const Row = ({ f, onToggle, peso }) => (
    <div className={'er-fcfg' + (f.ativo ? '' : ' off')}>
      <span className="drag"><Icon name="grip-vertical" size={18} /></span>
      <span className="fl">{f.label}</span>
      {avancado && peso && <span className="pw">×{f.peso}</span>}
      <ToggleSwitch on={f.ativo} onChange={() => onToggle(f.key)} />
    </div>
  );

  return (
    <>
      <Header title="Fundamentos" sub="Configurar avaliação" onBack={onBack} />
      <div className="er-body" style={{ paddingTop: 4 }}>
        <div className="er-card" style={{ padding: '13px 15px', display: 'flex', gap: 10, marginBottom: 6 }}>
          <Icon name="info" size={18} color="var(--green-600)" />
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.4 }}>Define o que aparece na <b>Avaliação rápida</b> e o que entra no cálculo de <b>equilíbrio dos times</b>.</p>
        </div>

        <div className="er-grouplabel">Escala de avaliação</div>
        <Segmented options={['1 a 3', '1 a 5', '1 a 10']} value={escala} onChange={setEscala} />

        <div className="er-grouplabel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Técnicos</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, textTransform: 'none', letterSpacing: 0, fontWeight: 600, color: 'var(--fg-3)', fontSize: 11.5 }}>Mostrar pesos <ToggleSwitch on={avancado} onChange={setAvancado} /></span>
        </div>
        <div className="er-group">{tec.map(f => <Row key={f.key} f={f} onToggle={toggle(setTec)} peso />)}</div>

        <div className="er-grouplabel">Comportamentais</div>
        <div className="er-group">{soft.map(f => <Row key={f.key} f={f} onToggle={toggle(setSoft)} />)}</div>

        <div style={{ marginTop: 16 }}><Button variant="secondary" full icon="plus">Adicionar fundamento</Button></div>
        <p style={{ fontSize: 11.5, color: 'var(--fg-4)', textAlign: 'center', marginTop: 12 }}>Ao menos um fundamento precisa permanecer ativo.</p>
      </div>
    </>
  );
}

/* ---------------- CONFIGURAÇÕES ---------------- */
function ConfigScreen({ onBack, theme, onTheme }) {
  const s = ER.settings;
  const [altura, setAltura] = useState('cm');
  const [tam, setTam] = useState('6×6');
  const [modo, setModo] = useState('Competitivo');
  const SRow = ({ icon, t, sub, right }) => (
    <div className="er-srow"><span className="si"><Icon name={icon} size={20} /></span><div className="sb"><div className="st">{t}</div>{sub && <div className="ss">{sub}</div>}</div>{right}</div>
  );
  const chev = <Icon name="chevron-right" size={18} color="var(--fg-4)" />;
  return (
    <>
      <Header title="Configurações" sub="Conta e preferências" onBack={onBack} />
      <div className="er-body" style={{ paddingTop: 4 }}>
        <div className="er-grouplabel">Conta</div>
        <div className="er-group">
          <div className="er-srow"><Avatar nome={s.professor.nome} size={44} /><div className="sb"><div className="st">{s.professor.nome}</div><div className="ss">{s.professor.email}</div></div>{chev}</div>
          <SRow icon="key-round" t="Trocar senha" right={chev} />
          <div className="er-srow" style={{ cursor: 'pointer' }}><span className="si" style={{ color: 'var(--loss-500)' }}><Icon name="log-out" size={20} /></span><div className="sb"><div className="st" style={{ color: 'var(--loss-500)' }}>Sair</div></div></div>
        </div>

        <div className="er-grouplabel">Preferências do app</div>
        <div className="er-group">
          <SRow icon="languages" t="Idioma" right={<span className="sv">{s.idioma}</span>} />
          <div className="er-srow"><span className="si"><Icon name="moon" size={20} /></span><div className="sb"><div className="st">Tema</div></div><div style={{ width: 210 }}><Segmented options={['Claro', 'Escuro', 'Sistema']} value={theme} onChange={onTheme} /></div></div>
          <div className="er-srow"><span className="si"><Icon name="ruler" size={20} /></span><div className="sb"><div className="st">Unidade de altura</div></div><div style={{ width: 130 }}><Segmented options={['cm', 'pol']} value={altura} onChange={setAltura} /></div></div>
        </div>

        <div className="er-grouplabel">Preferências de treino</div>
        <div className="er-group">
          <div className="er-srow"><span className="si"><Icon name="users" size={20} /></span><div className="sb"><div className="st">Tamanho do time</div></div><div style={{ width: 130 }}><Segmented options={['6×6', '7×7']} value={tam} onChange={setTam} /></div></div>
          <SRow icon="armchair" t="Tratar sobra" right={<span className="sv">{s.sobra}</span>} />
          <div className="er-srow"><span className="si"><Icon name="scale" size={20} /></span><div className="sb"><div className="st">Modo de montagem</div><div className="ss">Usado ao montar os times</div></div></div>
          <div style={{ padding: '0 14px 13px', background: 'var(--bg-surface)' }}><Segmented options={['Competitivo', 'Desenvolvimento']} value={modo} onChange={setModo} /></div>
        </div>

        <div className="er-grouplabel">Dados</div>
        <div className="er-group">
          <SRow icon="file-down" t="Exportar dados (CSV)" right={chev} />
          <SRow icon="cloud-upload" t="Backup" right={chev} />
        </div>

        <div className="er-grouplabel">Sobre</div>
        <div className="er-group">
          <SRow icon="circle-help" t="Ajuda" right={chev} />
          <SRow icon="info" t="Sobre o app" right={<span className="sv">v1.0</span>} />
        </div>
      </div>
    </>
  );
}

Object.assign(window, { FiliaisScreen, FilialDetailScreen, TurmasScreen, TurmaDetailScreen, FundamentosScreen, ConfigScreen });
