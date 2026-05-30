/* ============================================================
   Esporte Recreação — fake data + helpers for the UI kit
   Exposes window.ER = { alunos, turmas, fundamentos, ... helpers }
   ============================================================ */
(function () {
  const FUND = [
    { key: 'saque', label: 'Saque', abbr: 'SAQ' },
    { key: 'recepcao', label: 'Recepção', abbr: 'REC' },
    { key: 'levantamento', label: 'Levantamento', abbr: 'LEV' },
    { key: 'ataque', label: 'Ataque', abbr: 'ATQ' },
    { key: 'bloqueio', label: 'Bloqueio', abbr: 'BLO' },
    { key: 'defesa', label: 'Defesa', abbr: 'DEF' },
  ];

  // avatar palette (brand-derived). [bg, fg]
  const AV_COLORS = [
    ['#009C3B', '#fff'], ['#002776', '#fff'], ['#1A3C92', '#fff'],
    ['#F08C00', '#fff'], ['#006B29', '#fff'], ['#C99A00', '#2A1E00'],
    ['#00913A', '#fff'], ['#3055B0', '#fff'],
  ];

  function initials(nome) {
    const p = nome.trim().split(/\s+/);
    return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
  }
  function hash(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); }
  function avatarColor(nome) { return AV_COLORS[hash(nome) % AV_COLORS.length]; }

  // overall rating 50-99 from fundamentos (1-5 avg -> scaled)
  function geral(f) {
    const vals = FUND.map(x => f[x.key]);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length; // 1..5
    return Math.round(48 + (avg - 1) / 4 * 50); // ~48..98
  }

  // raw player defs: [nome, pos, idade, altura, mao, [saq,rec,lev,atq,blo,def], V, D]
  const POS = { LEV: 'Levantador', PON: 'Ponteiro', OPO: 'Oposto', CEN: 'Central', LIB: 'Líbero' };
  const raw = [
    ['Bruno Almeida', 'LEV', 16, 182, 'Destro', [4, 4, 5, 5, 3, 4], 12, 4],
    ['Lucas Ferreira', 'PON', 15, 178, 'Destro', [4, 4, 3, 5, 4, 4], 10, 6],
    ['Marina Souza', 'OPO', 16, 175, 'Canhota', [5, 3, 3, 5, 4, 3], 11, 5],
    ['Pedro Henrique', 'CEN', 17, 190, 'Destro', [3, 3, 2, 4, 5, 3], 9, 7],
    ['Joana Lima', 'LEV', 15, 170, 'Destra', [3, 4, 5, 3, 2, 5], 13, 3],
    ['Rafael Costa', 'PON', 16, 181, 'Destro', [4, 5, 3, 4, 3, 5], 8, 8],
    ['Carla Dias', 'LIB', 16, 165, 'Destra', [2, 5, 3, 2, 1, 5], 7, 5],
    ['Diego Martins', 'OPO', 17, 186, 'Canhoto', [5, 3, 2, 5, 4, 3], 10, 4],
    ['Beatriz Rocha', 'CEN', 15, 180, 'Destra', [3, 3, 3, 4, 5, 3], 6, 6],
    ['Thiago Nunes', 'PON', 16, 179, 'Destro', [4, 4, 3, 4, 3, 4], 9, 5],
    ['Camila Vieira', 'LIB', 15, 168, 'Destra', [2, 5, 4, 2, 1, 5], 5, 4],
    ['Gustavo Pires', 'CEN', 17, 192, 'Destro', [3, 2, 2, 4, 5, 2], 8, 6],
    ['Letícia Gomes', 'OPO', 16, 174, 'Destra', [4, 3, 3, 5, 3, 4], 7, 7],
    ['André Barros', 'LEV', 16, 177, 'Destro', [3, 4, 5, 3, 3, 4], 4, 3],
  ];

  const POS_ALT = { a1: ['OPO'], a2: ['OPO'], a5: ['LIB'], a8: ['PON'], a10: ['CEN'] };
  const alunos = raw.map((r, i) => {
    const f = {};
    FUND.forEach((x, j) => f[x.key] = r[5][j]);
    return {
      id: 'a' + (i + 1), nome: r[0], pos: r[1], posLabel: POS[r[1]],
      posAlt: POS_ALT['a' + (i + 1)] || [],
      idade: r[2], altura: r[3], mao: r[4], fundamentos: f,
      geral: geral(f), engajamento: null, presenca: 'pendente',
      vitorias: r[6], derrotas: r[7], foto: null,
    };
  });

  const filiais = [
    { id: 'f1', nome: 'Unidade Centro', cidade: 'São Paulo · Centro', endereco: 'Rua das Quadras, 120', telefone: '(11) 3344-1200', responsavel: 'Téc. Marcos Lima' },
    { id: 'f2', nome: 'Unidade Zona Sul', cidade: 'São Paulo · Zona Sul', endereco: 'Av. do Saque, 980', telefone: '(11) 3322-7788', responsavel: 'Téc. Aline Ramos' },
  ];

  const turmas = [
    { id: 't1', nome: 'Sub-17 Masculino', filialId: 'f1', filial: 'Unidade Centro', dias: 'Seg · Qua · Sex', hora: '18:30', nivel: 'Avançado', faixa: '15–17 anos', professor: 'Téc. Marcos', n: 14 },
    { id: 't2', nome: 'Iniciante Misto', filialId: 'f1', filial: 'Unidade Centro', dias: 'Ter · Qui', hora: '17:00', nivel: 'Iniciante', faixa: '12–14 anos', professor: 'Téc. Marcos', n: 12 },
    { id: 't3', nome: 'Sub-15 Feminino', filialId: 'f2', filial: 'Unidade Zona Sul', dias: 'Seg · Qua', hora: '19:00', nivel: 'Intermediário', faixa: '13–15 anos', professor: 'Téc. Aline', n: 11 },
  ];

  // ---- evaluation config (drives Avaliação + Montar Times) ----
  const fundConfig = {
    escala: 5,
    tecnicos: [
      { key: 'saque', label: 'Saque', ativo: true, peso: 1 },
      { key: 'recepcao', label: 'Recepção', ativo: true, peso: 1.2 },
      { key: 'levantamento', label: 'Levantamento', ativo: true, peso: 1.3 },
      { key: 'ataque', label: 'Ataque', ativo: true, peso: 1.4 },
      { key: 'bloqueio', label: 'Bloqueio', ativo: true, peso: 1 },
      { key: 'defesa', label: 'Defesa (manchete/dig)', ativo: true, peso: 1 },
      { key: 'posicionamento', label: 'Posicionamento', ativo: false, peso: 1 },
    ],
    soft: [
      { key: 'comportamento', label: 'Comportamento', ativo: true },
      { key: 'proatividade', label: 'Proatividade', ativo: true },
      { key: 'apoio', label: 'Apoio ao time', ativo: true },
      { key: 'comunicacao', label: 'Comunicação', ativo: false },
      { key: 'esforco', label: 'Esforço', ativo: true },
    ],
  };

  const settings = {    professor: { nome: 'Téc. Marcos Lima', email: 'marcos@esporterecreacao.com.br' },
    idioma: 'Português (BR)',
    tema: 'Claro',
    unidadeAltura: 'cm',
    tamanhoTime: '6×6',
    sobra: 'Banco / rodízio',
    modoMontagem: 'Competitivo',
  };

  // ---- session (treino) evaluations — engajamento + ajustes de fundamento ----
  const sessaoAval = {
    a1: { engajamento: 5, ajustes: [['recepcao', 'up']] },
    a3: { engajamento: 5, ajustes: [['ataque', 'up']] },
    a2: { engajamento: 4, ajustes: [] },
    a5: { engajamento: 4, ajustes: [['saque', 'down']] },
    a4: { engajamento: 3, ajustes: [['bloqueio', 'up']] },
    a8: { engajamento: 4, ajustes: [] },
  };


  const historico = [
    { id: 'm1', data: '27 mai', dataFull: 'Ter · 27 mai', turma: 'Sub-17 Masculino',
      a: { nome: 'Furacão', elenco: ['Bruno Almeida', 'Lucas Ferreira', 'Marina Souza', 'Carla Dias', 'Thiago Nunes', 'Gustavo Pires', 'André Barros'] },
      b: { nome: 'Tubarões', elenco: ['Pedro Henrique', 'Joana Lima', 'Rafael Costa', 'Diego Martins', 'Beatriz Rocha', 'Camila Vieira', 'Letícia Gomes'] },
      sets: [[25, 22], [23, 25], [15, 11]], vencedor: 'a', equilibrio: 93, jogo: 1, jogos: 1 },
    { id: 'm2', data: '23 mai', dataFull: 'Sex · 23 mai', turma: 'Sub-17 Masculino',
      a: { nome: 'Leões', elenco: ['Bruno Almeida', 'Diego Martins', 'Beatriz Rocha', 'Rafael Costa', 'Camila Vieira'] },
      b: { nome: 'Águias', elenco: ['Joana Lima', 'Marina Souza', 'Pedro Henrique', 'Carla Dias', 'Thiago Nunes'] },
      sets: [[25, 20], [25, 23]], vencedor: 'b', equilibrio: 88, jogo: 1, jogos: 1 },
    { id: 'm3', data: '20 mai', dataFull: 'Ter · 20 mai', turma: 'Sub-17 Masculino',
      a: { nome: 'Vendaval', elenco: ['Bruno Almeida', 'Lucas Ferreira', 'Pedro Henrique', 'Carla Dias'] },
      b: { nome: 'Trovão', elenco: ['Joana Lima', 'Rafael Costa', 'Diego Martins', 'Beatriz Rocha'] },
      sets: [[25, 18], [21, 25], [15, 13]], vencedor: 'a', equilibrio: 85, jogo: 1, jogos: 1 },
  ];

  // ---- balance engine: split present players into two teams ----
  function teamStats(team) {
    const s = {}; FUND.forEach(f => s[f.key] = 0);
    team.forEach(p => FUND.forEach(f => s[f.key] += p.fundamentos[f.key]));
    return s;
  }
  function forca(team) { return team.reduce((a, p) => a + p.geral, 0); }
  const isLev = p => p.pos === 'LEV';
  const canLev = p => p.pos === 'LEV' || (p.posAlt && p.posAlt.includes('LEV'));

  // 0..99 — combines total-force gap AND per-fundamento gap (why a near-tie is ~93%, not 99%)
  function balanceScore(t1, t2) {
    const s1 = teamStats(t1), s2 = teamStats(t2);
    let fundDiff = 0, fundMax = 0;
    FUND.forEach(f => { fundDiff += Math.abs(s1[f.key] - s2[f.key]); fundMax += (s1[f.key] + s2[f.key]) || 1; });
    const fundTerm = fundDiff / fundMax;                              // ~0.04 typical
    const fTot = (forca(t1) + forca(t2)) || 1;
    const forceTerm = Math.abs(forca(t1) - forca(t2)) / fTot;        // tiny when forças close
    let score = 100 - fundTerm * 130 - forceTerm * 90;
    const lev1 = t1.some(isLev), lev2 = t2.some(isLev);
    if (!lev1 || !lev2) score -= 22;
    if (!lev1 && t1.some(canLev)) score += 10;
    if (!lev2 && t2.some(canLev)) score += 10;
    return Math.max(20, Math.min(99, Math.round(score)));
  }

  // tier of each present player: topo / meio / base (thirds by GERAL)
  function tierMap(present) {
    const sorted = [...present].sort((a, b) => b.geral - a.geral);
    const n = sorted.length, cut = Math.max(1, Math.round(n / 3));
    const m = {};
    sorted.forEach((p, i) => { m[p.id] = i < cut ? 'topo' : (i >= n - cut ? 'base' : 'meio'); });
    return m;
  }
  function tiersOf(team, tm) {
    const o = { topo: 0, meio: 0, base: 0 };
    team.forEach(p => { o[tm[p.id]]++; });
    return o;
  }
  // Desenvolvimento rule: each team mixes levels — ≥1 topo AND ≥1 base (mentor + aprendiz)
  function isMixed(t1, t2, tm) {
    const a = tiersOf(t1, tm), b = tiersOf(t2, tm);
    return a.topo >= 1 && a.base >= 1 && b.topo >= 1 && b.base >= 1;
  }

  function levCount(present) { return present.filter(canLev).length; }

  // pick `2n` players to play, bench the lowest-GERAL leftover
  function selectPlaying(present, size) {
    const n = Math.min(size, Math.floor(present.length / 2));
    const byForce = [...present].sort((a, b) => b.geral - a.geral);
    const playing = byForce.slice(0, 2 * n);
    const bench = byForce.slice(2 * n);
    return { playing, bench, n };
  }

  function buildTeams(present, opts = {}) {
    const mode = opts.mode || 'Competitivo';
    const size = opts.size || 6;
    const { playing, bench, n } = selectPlaying(present, size);
    const tm = tierMap(present);
    const bothTiers = playing.some(p => tm[p.id] === 'topo') && playing.some(p => tm[p.id] === 'base');

    let best = null, bestObj = -Infinity;
    const evaluate = (t1, t2) => {
      const bal = balanceScore(t1, t2);
      if (mode === 'Desenvolvimento') {
        const mixed = !bothTiers || isMixed(t1, t2, tm);
        return (mixed ? 1000 : 0) + bal;     // hard-prefer mixed, then balance
      }
      return bal;                             // Competitivo: pure balance
    };

    // randomized restarts + a little local search
    const tries = 600;
    for (let k = 0; k < tries; k++) {
      const sh = [...playing];
      for (let i = sh.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[sh[i], sh[j]] = [sh[j], sh[i]]; }
      let t1 = sh.slice(0, n), t2 = sh.slice(n, 2 * n);
      // one local-improve pass: try swaps that raise the objective
      let obj = evaluate(t1, t2);
      for (let a = 0; a < t1.length; a++) for (let b = 0; b < t2.length; b++) {
        const n1 = [...t1], n2 = [...t2];[n1[a], n2[b]] = [n2[b], n1[a]];
        const o = evaluate(n1, n2);
        if (o > obj) { t1 = n1; t2 = n2; obj = o; }
      }
      if (obj > bestObj) { bestObj = obj; best = { t1, t2 }; }
    }

    const t1 = best.t1, t2 = best.t2;
    const mixed = bothTiers && isMixed(t1, t2, tm);
    const lev1 = t1.some(canLev), lev2 = t2.some(canLev);
    return {
      t1, t2, bench, n, score: balanceScore(t1, t2), mode, size,
      mixed, levOk: lev1 && lev2, levTotal: levCount(present),
      tiers: { t1: tiersOf(t1, tm), t2: tiersOf(t2, tm) }, tierMap: tm,
    };
  }

  window.ER = {
    FUND, POS, alunos, turmas, filiais, historico, fundConfig, settings, sessaoAval,
    initials, avatarColor, geral, teamStats, balanceScore, buildTeams, forca, tierMap, tiersOf, canLev,
  };
})();
