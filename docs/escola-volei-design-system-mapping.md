# Mapeamento do Design System — Esporte Recreação

**Fonte de verdade:** `design-system/` (tokens em `colors_and_type.css`, specs visuais em `preview/*.html`, código de referência em `ui_kits/esporte-recreacao-app/`).
**Implementação:** `src/`.
**Última auditoria:** 2026-05-30 — auditoria adversarial (8 agentes) comparou cada componente com seu preview HTML; 68 divergências encontradas e corrigidas. Verificado no browser real (capturas em `scripts/qa/shots/ds-app/` vs `scripts/qa/shots/ds-previews/`).

---

## 1. Tokens (`colors_and_type.css` → `src/styles/globals.css`)

Todos os valores no `@theme` do `globals.css` são **idênticos** ao `colors_and_type.css`. Tabela de verificação:

| Grupo | Token DS | Valor | Classe Tailwind |
|-------|----------|-------|-----------------|
| Verde | `--green-50..900` | `#E7F7EE`→`#06331A` (500=`#009C3B`) | `green-50`..`green-900` |
| Amarelo | `--yellow-50..600` | `#FFF8D6`→`#C99A00` (400=`#FFCB00`) | `yellow-50`..`yellow-600` |
| Azul | `--ink-500..900` | `#3055B0`→`#03112E` (700=`#002776`, 800=`#07204F`) | `ink-500`..`ink-900` |
| Neutros | `--gray-0..900` | `#FFFFFF`→`#141821` | `gray-0`..`gray-900` |
| Vitória | `--win-bg/300/500/700` | `#E4F6EB`/`#54C57F`/`#00913A`/`#006B29` | `win-bg`/`win-300`/`win-500`/`win-700` |
| Derrota | `--loss-bg/300/500/700` | `#FDEAEA`/`#F49497`/`#E5484D`/`#B4282D` | `loss-bg`/`loss-300`/`loss-500`/`loss-700` |
| Atraso | `--warn-bg/300/500/700` | `#FFF0DD`/`#FFB861`/`#F08C00`/`#A85A00` | `warn-bg`/`warn-300`/`warn-500`/`warn-700` |
| Equilíbrio | `--bal-bg/500/700` | `#E6ECFB`/`#1A3C92`/`#002776` | `bal-bg`/`bal-500`/`bal-700` |
| Texto | `--fg-1..4` | `#10131C`/`#4C5466`/`#6B7488`/`#97A1B4` | `fg-1`..`fg-4` |
| Bordas | `--border-1..3` | `#EAEEF5`/`#DCE2EC`/`#C2CAD8` | `border-1`..`border-3` |
| Superfícies | `--bg-app/surface/sunken/ink` | gray-50/gray-0/gray-100/ink-800 | `app`/`surface`/`sunken`/`ink-surface` |
| Radii | sm/md/lg/xl/2xl | 8/12/16/22/28px | `rounded-sm`..`rounded-2xl` |
| Sombras | sm/md/lg/cta/card | (exatas do DS) | `shadow-sm`..`shadow-card` (via var) |
| Fontes | display/body/stat/num | Archivo / Barlow / Barlow Semi Cond / Archivo | `font-display`/`font-body`/`font-stat`/`font-num` |

**Tipografia** (`.q-*` em globals.css = preview `type-*.html`): display 44px/900, h1 28px/800, h2 22px/700, h3 18px/700, body 16px, stat (Barlow Semi Cond), num (Archivo). ✅ fiéis.

**Dark theme:** `[data-theme="dark"]` remapeia as role-vars (surfaces navy, brand realçado, sem preto puro) — estratégia idêntica ao `app.css` do UI kit.

---

## 2. Previews HTML → componentes (status de fidelidade pós-correção)

| Preview (`design-system/preview/`) | Componente (`src/`) | Status | Notas |
|-----------------------------------|---------------------|--------|-------|
| `comp-playercard.html` | `components/students/PlayerCard.tsx` | ✅ fiel | gradiente radial `#009C3B→#07204F→#03112E`, sheen 135°, GERAL 52px Archivo, pill posição `#2A1E00`, avatar 96px borda branca, barras amarelas 5px, grid 7/16px |
| `comp-presenca.html` | `components/training/PresenceToggle.tsx` | ✅ fiel | pill branco + borda; win-500/loss-500/warn-500; ícone 18px. Label compacta no mobile (versão in-row do `app.css`) |
| `comp-equilibrio.html` | `components/training/BalanceIndicator.tsx` | ✅ fiel | bg gray-50 sem borda, % 22px Archivo, barra 12px, ícone bal-500 |
| `comp-resultado.html` | `components/history/ResultCard.tsx` | ✅ fiel | card branco radius 16 shadow-md sem borda, data uppercase, nomes Archivo 18px, placar Archivo 34px, win-700 |
| `comp-statbadge.html` | `components/students/StatBadge.tsx` | ✅ fiel | radius 12, padding 10/14, valor Archivo 900 20px, tones win/loss/warn/bal/neutral, label case natural |
| `comp-buttons.html` | `components/ui/button.tsx` | ✅ fiel | Archivo 700, radius 12; primary+shadow-cta; secondary green-50/green-700; ghost borda 1.5px; md h48 px22 svg20; lg(cta) h56 text18 |
| `comp-avaliacao.html` | `components/students/Scale5.tsx` + `components/training/Stepper.tsx` | ✅ fiel | Scale5: chips 42×42 radius 12 borda 1.5px Archivo 800, 2 estados. Stepper: pill + botões redondos |
| `comp-chip.html` | `components/students/Avatar.tsx` (+ chips em TeamPanel) | ✅ fiel | avatar circular cor determinística por nome; pill com pos tag amarela |
| `color-*.html` (green/accent-ink/bandeira/neutrals/semantic) | tokens globals.css | ✅ fiel | paleta 100% conferida (tabela §1) |
| `type-display/stats/body.html` | classes `.q-*` globals.css | ✅ fiel | escala tipográfica exata |
| `spacing-radii/elevation/scale.html` | tokens radii/shadow/spacing | ✅ fiel | 8/12/16/22/28 · sm/md/lg/cta/card · base 4pt |
| `brand-logo/appicon.html` | `public/favicon.svg` + assets | ⚠️ parcial | favicon criado na identidade (verde+amarelo). Logos SVG oficiais em `design-system/assets/` ainda não embutidos no header do app (v2) |

---

## 3. Código de referência (`ui_kits/.../*.jsx`) → implementação

| UI kit (referência) | Implementação | Observação |
|---------------------|---------------|------------|
| `components.jsx` (24 componentes) | `src/components/**` | portados; ver tabela §2 |
| `data.js` (`buildTeams`/`balanceScore`/`tierMap`/`geral`) | `src/engine/**` | engine portada fielmente (600 iterações, modos, constraint levantador). Fórmula geral = `round(48+(avg-1)/4*50)` |
| `screens.jsx` / `screens-share.jsx` / `screens-gerenciar.jsx` | `src/pages/**` | todas as telas implementadas |
| `app.css` (dark theme tokenizado) | `globals.css` `[data-theme=dark]` | mesma estratégia de role-vars |

---

## 4. Auditoria visual 1:1 renderizada (2ª rodada — pixel a pixel)

Após corrigir os tokens, foi feita comparação **visual renderizada** (não só leitura de código): a rota dev `/__showcase` renderiza cada componente com os MESMOS dados do preview; `scripts/qa/compare-ds.mjs` captura `app-*.png` e `prev-*.png` no mesmo tamanho em `scripts/qa/shots/compare/`. Encontradas e corrigidas 4 divergências que a auditoria de código não pegara:

1. **Stepper** — o app usava "−" cinza + "+" verde sem container; o preview tem **pill cinza (gray-50) com AMBOS os botões redondos brancos, ícone verde + shadow-sm**, valor central Archivo 900 24px. ✅ corrigido.
2. **PresenceToggle** — o componente escondia labels das opções inativas; o preview mostra **todos os labels sempre**. ✅ componente agora mostra todos; a prop `compact` (só ícone nas inativas) é usada **apenas na tela de Chamada** por densidade da lista em 390px.
3. **ResultCard** — faltava a **linha de elenco** ("Bruno, Lucas, Marina +4") em coluna sob cada time; o preview a exibe. ✅ corrigido (a query da lista agora traz `match_rosters` num único select com join — sem N+1).
4. **PlayerCard** — abreviação `Blo`→`Bloq` (fiel ao preview). ✅ corrigido.

Validação: QA E2E dos módulos afetados (04 treino, 05 histórico, 08 edge) = 34/34 verde após as mudanças.

## 5. Divergências aceitas (decisões conscientes, não defeitos)

1. **Chips de avatar:** o portrait grande do PlayerCard usa o gradiente verde do preview; os **chips pequenos** (listas/rosters) usam cor determinística por nome — conforme `README` do DS ("deterministic color from the name").
2. **PresenceToggle na tela de Chamada:** usa `compact` (label só no ativo) por densidade de lista em 390px; o **componente isolado** e o preview mostram todos os labels.
3. **Logos oficiais:** `design-system/assets/logo-mark.svg` e `app-icon.svg` existem; o header usa um ícone inline equivalente. Embutir os SVGs oficiais fica para v2.
4. **Iniciais do avatar:** o preview crava "BR" (2 primeiras letras de "Bruno"); o app deriva iniciais primeiro+último nome ("Bruno Almeida" → "BA"), padrão consistente em todo o app. O "BR" do preview é mock (incoerente com o nome "Almeida" que ele próprio mostra). Tamanho, forma, cor, borda e fonte do avatar são idênticos — só as 2 letras divergem por serem derivadas do dado real.
5. **Dia da semana no card de resultado:** o preview crava "TER" (mock); o app calcula o dia real (2026-05-27 = QUA). O **formato** foi alinhado ao preview via `formatMatchCardDate` ("ddd · DD mmm", middot, sem ano/pontos, uppercase por CSS). Só o valor do weekday difere, por ser derivado da data real.

## 6. Como re-auditar visualmente
- `node scripts/qa/compare-ds.mjs` (com dev server de pé) → gera os pares `scripts/qa/shots/compare/app-*.png` × `prev-*.png`.
- Inspeção manual: `http://localhost:5173/__showcase` (rota só montada em dev; fora do bundle de produção).

---

## 5. Como re-auditar
- Renderizar previews: `node scripts/qa/shoot-previews.mjs` → `scripts/qa/shots/ds-previews/`
- Capturar app: `node scripts/qa/capture-components.mjs` → `scripts/qa/shots/ds-app/`
- Comparar par a par. Auditoria automática: workflow `ds-fidelity-audit` (8 agentes, 1 por componente).

**Veredicto:** design system respeitado. Tokens 100% fiéis; 8/8 componentes auditados alinhados aos previews após correção; 4 divergências documentadas como decisões conscientes.
