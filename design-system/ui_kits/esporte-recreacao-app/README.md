# Esporte Recreação — App UI Kit

High-fidelity, mobile-first recreation of the **Esporte Recreação** volleyball coaching app. This is a click-through prototype (cosmetic, not production logic) built on the project design tokens.

## Run
Open `index.html`. It scales a 390×844 phone frame to fit the viewport.

## Flow (the daily path)
**Início** (pick a turma) → **Iniciar treino** → **Chamada** (presence toggles) → **Montar times** (auto-balanced teams) → **Registrar resultado** (per-set score entry: +/− or keypad, add/remove sets, formato, auto-winner + manual/W.O.) → **Detalhe da partida** → **Histórico**.
Tap any player in **Alunos** to open the **Perfil do aluno** (Dados + Desempenho/player card). Tap any result in **Histórico** to open the **Detalhe da partida** (set-by-set, balance + força, full rosters, edit/share/delete). From there, **Compartilhar** opens the reusable image generator (formats, include-toggles, themes — also used for the player card) and **Ver avaliações desse treino** opens the session evaluation list (engajamento + fundamento adjustments per present player).

## Management (via the **Menu** tab)
**Filiais** (list + detail), **Turmas** (list, filter by filial, + detail with roster), **Alunos** (profile two-tabs), **Fundamentos** (configure which skills feed Avaliação + team balance, scale, weights), **Configurações** (conta, preferências do app, preferências de treino, dados, sobre). The management area uses a back-stack. **Filial and Turma details** open in a read view (`InfoRow` rows) with an **Editar → Salvar** toggle; the list **"+"** opens the same screen empty ("Nova filial" / "Nova turma", the latter pre-linked to its filial). Empty filiais show an "adicionar primeira turma" CTA, and a filial with active turmas can't be deleted (only archived) — the delete is locked with an explanation.

## Files
| File | Contents |
|---|---|
| `index.html` | Loads React 18 + Babel + Lucide + tokens, mounts the app. |
| `data.js` | Fake data (14 alunos, turmas, histórico) + helpers: `initials`, `avatarColor`, `geral`, `buildTeams` (mode-aware), `balanceScore`, `tierMap`, `tiersOf`. Exposed as `window.ER`. |
| `app.css` | All component + screen styles, token-based. |
| `components.jsx` | Primitives → `Icon`, `Avatar`, `Chip`, `Button`, `StatBadge`, `PresencaToggle`, `Stepper`, `Scale5`, `BalanceIndicator`, `TeamPanel`, `ResultCard`, `PlayerCard`, `BottomNav`, `Header`, `StatusBar`, `EmptyState`, `Sheet`, `Field`, `ToggleSwitch`, `Tabs`, `Segmented`, `NivelTag`, `PositionField` (principal + alternativas). |
| `screens.jsx` | `HomeScreen`, `ChamadaScreen`, `MontarScreen`, `HistoricoScreen`, `AlunosScreen`, `AlunoDetailScreen` (two tabs), `PartidaDetailScreen` (match detail). |
| `screens-share.jsx` | `ShareScreen` + reusable `ShareCard`, `AvaliacoesScreen` (session list), `RegistrarResultadoScreen` (score entry), `AvaliarAlunoScreen` (rapid per-player evaluation). |
| `screens-gerenciar.jsx` | Management area → `FiliaisScreen` + `FilialDetailScreen` (view/edit/new modes, archive, delete-locked-when-active), `TurmasScreen` + `TurmaDetailScreen` (view/edit/new, roster, delete), `FundamentosScreen`, `ConfigScreen`. Detail screens share an `InfoRow` read view and the same Editar↔Salvar toggle. |
| `app.jsx` | App state machine + management nav stack, `MenuScreen`, `ResultadoSheet`, viewport scaling, mount. |
| `colors_and_type.css` | Copy of the project tokens (kept local so the kit is self-contained). |
| `assets/` | Logo marks + app icon. |

## Notes / shortcuts
- **Dark theme** is fully tokenized: `app.css` has a `.er-phone[data-theme="dark"]` block that remaps the role tokens (surfaces, text, borders, brand greens, state colors, shadows). Components reference tokens only, so the toggle flips the whole app at once. **Configurações → Tema** (Claro / Escuro / Sistema) drives it; the choice persists in `localStorage`, and "Sistema" follows `prefers-color-scheme`. In dark, elevation comes from surface contrast (`surface` vs `surface-2`) rather than shadow, greens/reds are brightened for legibility, and the navy is a soft navy-black (never pure `#000`).
- **Icons:** Lucide via CDN. The `Icon` component injects the SVG imperatively so React never fights Lucide's DOM mutation.
- **Avatars:** initials on a deterministic brand color (no photos shipped). Drop real photos into `PlayerCard`/`Avatar` later.
- **Posição:** edited in the Aluno **Dados** tab via `PositionField` — single-select *principal* (becomes the LEV/PON/OPO/CEN/LIB tag on the card + team panels) plus multi-select *alternativas*. The balancer treats an alternate-setter as a soft fallback so a team is less likely to end up with no levantador. Note: the **LEV tag** (position) is distinct from the **Lev bar** (the *Levantamento* fundamento).
- **Team balance** is a real (if simple) engine in `data.js` — `buildTeams(present, {mode, size})` runs randomized restarts + a local-swap pass and scores each split by the **mode's objective**:
  - **Competitivo** → maximize the balance index (combines total-força gap *and* per-fundamento gap, which is why a near-tie reads ~93%, not 99%).
  - **Desenvolvimento** → hard-prefer splits where **each team mixes levels** (≥1 topo + ≥1 base = mentor + aprendiz, via thirds of GERAL), then most balanced among those. Shows a "times mistos por nível" label + a topo/meio/base badge per team; a slightly lower index is expected, not a defect.
  - Both modes keep **≥1 levantador per team** (principal or, as fallback, alternativa) and **warn** when there aren't enough setters. The **Opções de montagem** block (Modo / Tamanho 6×6·7×7 / Tratar sobra) remounts on the spot; manual tap-to-swap recomputes the index live.
- **Overlays** (`Sheet`, `Ficha`) render correctly in a real browser; note that flat DOM-to-image screenshot tools may not capture the animated overlay even though it's in the DOM.
- Each `<script type="text/babel">` shares one global scope — hooks are destructured once in `components.jsx` and reused; components export to `window`.
