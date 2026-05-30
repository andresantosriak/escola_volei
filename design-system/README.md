# Esporte Recreação — Design System

**Esporte Recreação** is a mobile-first app for volleyball coaches to run training sessions: take attendance, rate players quickly, **auto-build two balanced teams**, and log match results so every player accrues a win/loss record over time.

> ⚠️ **Greenfield brand, evolving with feedback.** No codebase, Figma, or brand assets were provided — only the product brief (*Sistema de Vôlei*). The **name "Esporte Recreação"** was supplied by the client. The **palette is the Brazilian national-team identity** — *verde, amarelo e azul da bandeira* — confirmed as the preferred direction. The logo mark and type pairing are an original starting point; treat them as **placeholders to validate or replace.** See the CAVEATS / ASK at the bottom.

---

## 1. Product context

- **Who:** the volleyball coach / PE teacher, one person.
- **Where:** courtside, standing, sun, one hand, low attention. Speed is everything.
- **The core job:** *"Fazer a chamada, avaliar rápido, dividir times justos e registrar o resultado — em poucos toques."*
- **Scale:** ~14 players per class; multiple classes; multiple branches (filiais).
- **The hero feature:** the **team builder** ("Montar times") — balances each *fundamento* (skill) across two teams and distributes scarce positions (especially setter / levantador), then lets the coach drag to adjust with a live balance indicator.
- **The motivational object:** the **player card** ("Card do jogador") — a premium, gamified, FUT-style card with an overall rating, attribute bars, and win/loss record. Built to be shown off to players and parents.

### Surfaces / products
One product: the **Esporte Recreação** mobile app (coach-facing). The UI kit lives in `ui_kits/esporte-recreacao-app/`. A phase-2 "Insights" dashboard is out of scope for this system.

### Sources
- Product brief: *Briefing de Design — App de Gestão de Turmas de Vôlei* (provided in the project request).
- No external repos, Figma files, or decks were supplied.

---

## 2. CONTENT FUNDAMENTALS — voice & copy

The product language is **Brazilian Portuguese (pt-BR)**. UI copy in this system is written in pt-BR; this README is in English for the design team.

- **Tone:** direct, sporty, encouraging — like a good coach. Short imperatives. *"Iniciar treino", "Montar times", "Registrar resultado", "Reequilibrar".*
- **Person:** speaks **to** the coach, but mostly through actions (verbs) rather than "você". Player-facing strings (the card) celebrate the athlete: *"Em evolução", "Melhor saque da turma".*
- **Casing:** **Sentence case** for everything readable (titles, buttons, body). **UPPERCASE** reserved for tiny overline labels, stat units, and the wordmark (`PRESENÇA`, `GERAL`, `V / D`). Never all-caps sentences.
- **Numbers are protagonists.** Lead with the stat, label it small underneath: `87` over `GERAL`, `11/14` over `PRESENTES`. Use `V`/`D` for vitórias/derrotas, `%` for aproveitamento.
- **Empty states are friendly, never blank.** They name the situation and give one clear CTA. Examples:
  - First run: *"Nenhuma turma ainda. Crie sua primeira turma para começar."*
  - New player: *"Amostra insuficiente — jogue mais treinos para liberar as notas."* (never show shaky ratings)
  - No matches: *"Sem partidas registradas. Monte os times e jogue!"*
- **Microcopy length:** buttons 1–2 words; section headers 1–3 words; helper text one short line.
- **Emoji:** **not used** in product UI. Energy comes from color, type weight, and the card visuals — not emoji. (Icons do that job.)
- **Vibe words:** rápido, justo, energético, legível-a-distância, gamificado-mas-confiável.

---

## 3. VISUAL FOUNDATIONS

The identity is the **Brazilian flag** — *verde, amarelo e azul* — the colors of the seleção. Energetic, patriotic, instantly sporty.

### Color
- **Verde Canarinho** (`--green-500 #009C3B`) is the **primary** — buttons, links, active nav, selected states, the "present"/"win" positive. It's the brand.
- **Amarelo Ouro** (`--yellow-400 #FFCB00`) is the **accent** — ratings, the overall number on the player card, highlights, the "ace" dot in the logo. Used as a spark, never as large fills behind text.
- **Azul Bandeira** (`--ink-700 #002776` → `--ink-800/900`) is the **premium/dark surface** — the player card, dark headers, app-icon depth. Yellow + green on navy = the seleção jersey.
- **Branco** is the everyday app surface; background is `--gray-50`, cards are white.
- **State colors are doubled with icons, never color-only:** green = presente / vitória, red = falta / derrota, **orange** = atraso / atenção (kept clear of the canary accent), **flag-blue** = team balance. Each always pairs with an icon + text for sun legibility and accessibility.

### Type
- **Archivo** — display, headlines, and **big stat numbers** (jersey feel; goes to weight 900).
- **Barlow** — body, UI, labels; slightly athletic, very legible small. Use `font-variant-numeric: tabular-nums` for stat columns.
- **Barlow Semi Condensed** — dense stat blocks where space is tight.
- Scale is mobile-first (base 16px); on the player card numbers jump to 44px+.
- **Both families load from Google Fonts.** No licensed font files were provided — flagged for replacement if the team has brand fonts.

### Spacing & layout
- **4pt base** spacing scale (`--sp-1`=4 … `--sp-9`=56).
- Mobile canvas **390×844** (iPhone 14-class). Content gutters 16–20px.
- **One-handed:** primary actions sit low (thumb zone) as a sticky bottom bar / big CTA. Min touch target **48px**.
- Generous, card-based layout — big tap targets, lots of breathing room, never dense forms.

### Shape & elevation
- **Corner radii:** controls 8–12px, cards **16px**, sheets/large cards 22px, the **player card 28px**, pills/chips fully rounded.
- **Cards:** white surface, 16px radius, soft `--shadow-md`, hairline border `--border-1` only when on white-on-white. No colored left-border accent stripes.
- **Shadows:** soft, low-opacity, cool-tinted. Three steps (sm/md/lg) plus a **green glow** (`--shadow-cta`) for the primary CTA and a deep `--shadow-card` for the floating player card.
- **Gradients** appear only on: the player card surface (navy → green sheen) and the app icon. Everything else is flat fills.

### Motion
- Quick and physical. `--dur-base` 200ms, `--ease-out` for most transitions.
- **Spring** (`--ease-spring`) on satisfying confirmations: presence toggle, team-balance settle, rating bump.
- Presence/result changes animate color + icon together. Avoid long fades; courtside attention is short.

### Interaction states
- **Press:** scale to ~0.97 + slightly darker fill (e.g. `--green-600`). Tactile, immediate.
- **Selected/active:** filled green or green-tinted surface + bold weight.
- **Focus:** 2px `--focus-ring` (green-400) outline with 2px offset.
- **Disabled:** `--fg-4` text, reduced surface, no shadow.
- **Hover** (tablet only): subtle surface darken or shadow lift — touch is the primary model.

### Imagery
- Player photos shown as **round avatars** (chips) and as the **portrait area of the player card**. Where no photo exists, a colored **initials avatar** is used (deterministic color from the name). Real photos would be warm, high-energy action shots — supplied by the coach.

---

## 4. ICONOGRAPHY

- **Icon set: [Lucide](https://lucide.dev)** — clean, consistent 2px-stroke, rounded-cap line icons. Loaded from CDN (`lucide@latest`). Lucide fits the energetic-but-clean tone and ships a `volleyball` glyph.
- **Substitution flag:** no icon assets were provided with the brief. Lucide is the chosen system; if the team has a proprietary set, swap the CDN link.
- **Stroke style:** 2px stroke, rounded caps/joins, 24px default box; 20px in chips, 28px in primary actions. Color inherits `currentColor`.
- **Usage:** icons always pair with state color + (often) a text label — never color-only. Common glyphs: `volleyball`, `users`, `user-check` / `user-x` / `user-minus` (presença), `clock` (atraso), `trophy` (vitória), `shuffle` / `scale` (montar/reequilibrar times), `plus`/`minus` (stepper de avaliação), `chevron-right`, `calendar`, `history`, `bar-chart-3`, `settings`.
- **Emoji:** not used. **Unicode symbols:** only `×` for the "Time A × Time B" matchup separator and `+`/`−` math signs.
- **Brand mark vs icons:** the volleyball **logo mark** (`assets/logo-mark.svg`) is a filled brand asset, distinct from the line-icon system — don't use it as an inline icon.

---

## 5. INDEX — what's in this system

| File / folder | What it is |
|---|---|
| `README.md` | This file — context, voice, visual foundations, iconography, index. |
| `colors_and_type.css` | All design tokens: color primitives + semantic roles, type scale & classes, spacing, radii, shadows, motion. **Import this in every surface.** |
| `SKILL.md` | Agent-Skill manifest so this system works as a downloadable Claude skill. |
| `assets/` | Brand marks: `logo-mark.svg`, `logo-mark-light.svg`, `app-icon.svg`. |
| `preview/` | Design-system cards (colors, type, spacing, components) shown in the Design System tab. |
| `ui_kits/esporte-recreacao-app/` | The app UI kit — `index.html` (interactive click-through of core screens) + JSX components + its own README. |

### Quick start
1. Add the fonts + tokens to your `<head>`:
   ```html
   <link rel="stylesheet" href="colors_and_type.css">
   <script src="https://unpkg.com/lucide@latest"></script>
   ```
2. Build with the tokens (`var(--green-500)`, `.q-h1`, `--sp-4`, …).
3. Pull components/screens from `ui_kits/esporte-recreacao-app/`.

---

## CAVEATS & ASK
- **Brand identity is set to the seleção palette** (verde / amarelo / azul). Confirmed via review feedback. ✅
- **Name** "Esporte Recreação" is locked in per the client.
- **Logo mark** (volleyball + ace dot) is an original placeholder. **Do you have an existing logo?** Send it and I'll swap everything.
- **Fonts** are Google Fonts (Archivo + Barlow) standing in for any licensed brand fonts. Send brand fonts if they exist.
- **Icons** are Lucide via CDN. Swap if you have a house set.
- **Player photos** are initials-avatar placeholders. Real action photos will make the player card sing.

**Tell me which of these to lock vs. rework — and I'll iterate the system to perfect.**
