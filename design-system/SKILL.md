---
name: esporte-recreacao-design
description: Use this skill to generate well-branded interfaces and assets for Esporte Recreação (a Brazilian volleyball class-management app), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. The identity is the Brazilian seleção palette — verde, amarelo e azul.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

- **Tokens:** `colors_and_type.css` — import it and build with the CSS variables (`--green-500` primary, `--yellow-400` accent, `--ink-700` azul bandeira; `.q-h1`, `--sp-4`, radii, shadows, motion).
- **Foundations & voice:** `README.md` — palette rationale, pt-BR copy tone (direct, sporty, encouraging; sentence case; stats as protagonists; no emoji), iconography (Lucide), spacing, shape, motion.
- **Cards:** `preview/` — visual specimens of colors, type, spacing, and components.
- **UI kit:** `ui_kits/esporte-recreacao-app/` — interactive app recreation with reusable JSX components (player card, chip, presence toggle, team panel, balance indicator, result card, etc.).
- **Brand assets:** `assets/` — `logo-mark.svg`, `logo-mark-light.svg`, `app-icon.svg`.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask some clarifying questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

**Brand quick facts**
- Name: **Esporte Recreação** (volleyball coaching app, pt-BR).
- Colors: Verde Canarinho `#009C3B` (primary), Amarelo Ouro `#FFCB00` (accent), Azul Bandeira `#002776` (premium/dark). States: green=presente/vitória, red=falta/derrota, orange=atraso, blue=equilíbrio.
- Type: **Archivo** (display + big stat numbers) + **Barlow** (body/UI). Google Fonts.
- Icons: **Lucide** (CDN), 2px stroke. No emoji.
- Hero object: the gamified **player card** (navy + green + yellow, big overall rating).
