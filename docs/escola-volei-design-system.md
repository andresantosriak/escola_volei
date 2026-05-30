# Esporte Recreacao — Design System (Tailwind + shadcn/ui)

Adaptacao 1:1 do design system do prototipo cosmético para stack de producao (Vite + React + Tailwind CSS + shadcn/ui). Este documento e a fonte de verdade para o Stack Agent — nenhum token, cor ou componente deve ser inventado fora do que esta aqui.

---

## 1. Analise e Direcao Visual

### Sinais derivados do prototipo

| Sinal | Direcao |
|-------|---------|
| App mobile-first para professor de volei, uso em quadra | Touch-first, elementos grandes, densidade minima, uma mao |
| Paleta da selecao brasileira (verde/amarelo/azul) | Identidade esportiva patriotica, energetica |
| Player card estilo FUT, gamificado | Premium, dark surfaces para destaque, tipografia bold |
| Publico: professor/tecnico, uso diario rapido | Velocidade > estetica. Legibilidade a distancia. Sem distracao |
| ~14 jogadores por turma, multiplas turmas/filiais | Cards generosos, navegacao rapida entre contextos |

### Direcao escolhida

**Selecao Brasileira** — paleta verde/amarelo/azul bandeira, tipografia atletica (Archivo display + Barlow body), mobile-first 390x844, card-based layout com espacamento generoso, player card premium em surface navy. **Aprovada pelo cliente no prototipo.**

### Referencias

Design system original completo em `/design-system/` — prototipo interativo click-through com 24+ componentes e todas as telas do MVP implementadas em JSX + CSS tokenizado.

---

## 2. Mapeamento de Tokens: CSS Variables -> Tailwind Config

### 2.1 Cores

```typescript
// tailwind.config.ts — extend.colors
colors: {
  // --- Brand: Verde Canarinho (primary) ---
  green: {
    50:  "#E7F7EE",
    100: "#C4EBD3",
    200: "#8FD9AB",
    300: "#54C57F",
    400: "#1BAE57",
    500: "#009C3B",   // primary — bandeira green
    600: "#008733",   // primary pressed
    700: "#006B29",
    800: "#00511F",
    900: "#06331A",
  },
  // --- Brand: Amarelo Ouro (accent) ---
  yellow: {
    50:  "#FFF8D6",
    100: "#FFEEA0",
    300: "#FFDD3D",
    400: "#FFCB00",   // accent — bandeira yellow
    500: "#F0BC00",   // accent pressed
    600: "#C99A00",
  },
  // --- Brand: Azul Bandeira / Ink (premium surfaces) ---
  ink: {
    500: "#3055B0",
    600: "#1A3C92",
    700: "#002776",   // bandeira blue
    800: "#07204F",   // player-card base
    900: "#03112E",
  },
  // --- Neutrals ---
  gray: {
    0:   "#FFFFFF",
    25:  "#FBFCFE",
    50:  "#F4F6FB",
    100: "#EAEEF5",
    200: "#DCE2EC",
    300: "#C2CAD8",
    400: "#97A1B4",
    500: "#6B7488",
    600: "#4C5466",
    700: "#353C4D",
    800: "#232936",
    900: "#141821",
  },
  // --- Semanticas: Win / Presente ---
  win: {
    bg:  "#E4F6EB",
    300: "#54C57F",
    500: "#00913A",
    700: "#006B29",
  },
  // --- Semanticas: Loss / Falta ---
  loss: {
    bg:  "#FDEAEA",
    300: "#F49497",
    500: "#E5484D",
    700: "#B4282D",
  },
  // --- Semanticas: Warn / Atraso ---
  warn: {
    bg:  "#FFF0DD",
    300: "#FFB861",
    500: "#F08C00",
    700: "#A85A00",
  },
  // --- Semanticas: Balance / Info ---
  bal: {
    bg:  "#E6ECFB",
    500: "#1A3C92",
    700: "#002776",
  },
  // --- Surface roles (usadas via CSS variables para dark mode) ---
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
},
```

### 2.2 Tipografia

```typescript
// tailwind.config.ts — extend.fontFamily
fontFamily: {
  display: ["Archivo", "system-ui", "sans-serif"],       // headlines, big stats
  body:    ["Barlow", "system-ui", "sans-serif"],         // body, UI, labels
  stat:    ["Barlow Semi Condensed", "Barlow", "sans-serif"], // dense stat blocks
  num:     ["Archivo", "system-ui", "sans-serif"],        // big rating numbers, tabular
},

// extend.fontSize (mobile-first scale do prototipo)
fontSize: {
  micro:   ["0.6875rem", { lineHeight: "1" }],            // 11px — overline labels
  xs:      ["0.75rem",   { lineHeight: "1rem" }],          // 12px — captions
  sm:      ["0.875rem",  { lineHeight: "1.45" }],          // 14px — texto auxiliar
  base:    ["1rem",      { lineHeight: "1.45" }],          // 16px — body padrao
  lg:      ["1.125rem",  { lineHeight: "1.2" }],           // 18px — H3
  xl:      ["1.375rem",  { lineHeight: "1.2" }],           // 22px — H2
  "2xl":   ["1.75rem",   { lineHeight: "1.2" }],           // 28px — H1
  display: ["2.75rem",   { lineHeight: "1.05" }],          // 44px — hero rating
},

// extend.letterSpacing
letterSpacing: {
  display: "-0.02em",
  tight:   "-0.01em",
  label:   "0.06em",     // uppercase overlines
},
```

**Carregamento de fontes (globals.css):**

```css
/* Opcao A (Google Fonts — prototipos): */
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Barlow:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@600;700&display=swap');

/* Opcao B (self-hosted — producao, recomendado):
   npm i @fontsource/archivo @fontsource/barlow
   @import '@fontsource/archivo/500.css';
   @import '@fontsource/archivo/600.css';
   @import '@fontsource/archivo/700.css';
   @import '@fontsource/archivo/800.css';
   @import '@fontsource/archivo/900.css';
   @import '@fontsource/barlow/400.css';
   @import '@fontsource/barlow/500.css';
   @import '@fontsource/barlow/600.css';
   @import '@fontsource/barlow/700.css';
*/
```

### 2.3 Espacamento

```typescript
// tailwind.config.ts — extend.spacing (4pt base do prototipo)
spacing: {
  "sp-1": "4px",     // --sp-1
  "sp-2": "8px",     // --sp-2
  "sp-3": "12px",    // --sp-3
  "sp-4": "16px",    // --sp-4 (gutter padrao)
  "sp-5": "20px",    // --sp-5
  "sp-6": "24px",    // --sp-6
  "sp-7": "32px",    // --sp-7
  "sp-8": "40px",    // --sp-8
  "sp-9": "56px",    // --sp-9
},
```

> Nota: Tailwind ja tem escala de spacing compativel (4=16px, 5=20px, 8=32px). Usar a escala nativa do Tailwind quando coincidir. Os tokens `sp-*` existem para casos onde a referencia ao design system precisa ser explicita.

### 2.4 Border Radius

```typescript
// tailwind.config.ts — extend.borderRadius
borderRadius: {
  sm:   "8px",     // --r-sm: controles
  md:   "12px",    // --r-md: inputs, buttons
  lg:   "16px",    // --r-lg: cards
  xl:   "22px",    // --r-xl: sheets, large cards
  "2xl":"28px",    // --r-2xl: player card
  pill: "999px",   // --r-pill: chips, badges, toggles
},
```

### 2.5 Sombras

```typescript
// tailwind.config.ts — extend.boxShadow
boxShadow: {
  sm:   "0 1px 2px rgba(16,19,28,0.06), 0 1px 1px rgba(16,19,28,0.04)",
  md:   "0 4px 12px rgba(16,19,28,0.08), 0 2px 4px rgba(16,19,28,0.04)",
  lg:   "0 12px 28px rgba(16,19,28,0.12), 0 4px 8px rgba(16,19,28,0.06)",
  cta:  "0 8px 20px rgba(0,156,59,0.32)",      // green glow para CTA primary
  card: "0 18px 40px rgba(11,15,31,0.35)",     // premium player card
},
```

### 2.6 Motion / Transicoes

```typescript
// tailwind.config.ts — extend
transitionDuration: {
  fast: "120ms",    // --dur-fast: hover, press
  base: "200ms",    // --dur-base: maioria das transicoes
  slow: "320ms",    // --dur-slow: sheets, modais
},
transitionTimingFunction: {
  "ease-out":  "cubic-bezier(0.22, 1, 0.36, 1)",       // --ease-out
  "spring":    "cubic-bezier(0.34, 1.56, 0.64, 1)",    // --ease-spring: confirmacoes
},
```

### 2.7 CSS Variables (globals.css)

```css
@layer base {
  :root {
    /* Surface roles */
    --background: 227 24% 97%;      /* gray-50 #F4F6FB */
    --foreground: 224 30% 9%;       /* fg-1 #10131C */
    --card: 0 0% 100%;              /* white */
    --card-foreground: 224 30% 9%;
    --primary: 152 100% 30%;        /* green-500 #009C3B */
    --primary-foreground: 0 0% 100%;
    --secondary: 148 100% 95%;      /* green-50 #E7F7EE */
    --secondary-foreground: 152 100% 16%; /* green-700 #006B29 */
    --accent: 48 100% 50%;          /* yellow-400 #FFCB00 */
    --accent-foreground: 36 100% 8%; /* fg-on-yellow #2A1E00 */
    --destructive: 0 76% 57%;       /* loss-500 #E5484D */
    --destructive-foreground: 0 0% 100%;
    --muted: 225 24% 95%;           /* gray-100 #EAEEF5 */
    --muted-foreground: 222 12% 47%; /* fg-2 #4C5466 */
    --border: 225 24% 95%;          /* border-1 #EAEEF5 */
    --input: 222 18% 88%;           /* border-2 #DCE2EC */
    --ring: 146 73% 39%;            /* green-400 #1BAE57 (focus ring) */
    --radius: 12px;

    /* Text hierarchy */
    --fg-1: #10131C;
    --fg-2: #4C5466;
    --fg-3: #6B7488;
    --fg-4: #97A1B4;
    --fg-on-green: #FFFFFF;
    --fg-on-ink: #EEF1FA;
    --fg-on-yellow: #2A1E00;

    /* Borders */
    --border-1: #EAEEF5;
    --border-2: #DCE2EC;
    --border-3: #C2CAD8;
  }

  .dark {
    --background: 218 47% 8%;       /* dark bg-app #0B1422 */
    --foreground: 222 30% 95%;      /* dark fg-1 #ECF1F8 */
    --card: 219 47% 16%;            /* dark bg-surface #15203A */
    --card-foreground: 222 30% 95%;
    --primary: 146 77% 43%;         /* dark green-500 #1FB85B */
    --primary-foreground: 0 0% 100%;
    --secondary: 219 47% 16%;
    --secondary-foreground: 222 30% 95%;
    --accent: 48 91% 52%;           /* dark yellow-400 #F5C518 */
    --accent-foreground: 36 100% 8%;
    --destructive: 0 100% 71%;      /* dark loss-500 #FF6B6B */
    --destructive-foreground: 0 0% 100%;
    --muted: 219 47% 16%;
    --muted-foreground: 216 17% 72%; /* dark fg-2 #B6C2D6 */
    --border: 0 0% 100% / 0.08;
    --input: 0 0% 100% / 0.14;
    --ring: 146 77% 50%;            /* dark focus ring #2DD46E */
    --radius: 12px;

    --fg-1: #ECF1F8;
    --fg-2: #B6C2D6;
    --fg-3: #94A2BC;
    --fg-4: #6E7E99;
    --fg-on-green: #FFFFFF;
    --fg-on-ink: #EEF1FA;
    --fg-on-yellow: #2A1E00;

    --border-1: rgba(255,255,255,0.08);
    --border-2: rgba(255,255,255,0.14);
    --border-3: rgba(255,255,255,0.22);
  }
}
```

### 2.8 Z-index Scale

```
z-0      -> conteudo estatico (cards, secoes)
z-10     -> tooltips inline
z-20     -> header sticky, bottom nav
z-30     -> dropdown, popover
z-40     -> scrim (sheet backdrop)
z-50     -> sheet, dialog, modais
z-[60]   -> toast (sonner)
```

---

## 3. Sistema de Icones

**Biblioteca: lucide-react** (alinhado ao design system original que usa Lucide via CDN).

```typescript
// Tamanhos padrao:
//   14-16px -> icone inline em texto, badge, caption
//   18-20px -> icone de acao inline (input, botao ghost, nav)
//   22-24px -> icone de botao padrao, card header (DEFAULT)
//   28-30px -> icone de empty state pequeno
//   48-64px -> icone ilustrativo (empty state grande)

// Stroke: 2px padrao, 2.4px quando ativo (nav selecionada)
// Cor: herda currentColor

// Botoes icon-only SEMPRE com aria-label:
// <Button variant="ghost" size="icon" aria-label="Voltar">
//   <ChevronLeft size={22} />
// </Button>
```

**Icones usados no app** (mapa completo do prototipo):

| Contexto | Icone Lucide |
|----------|-------------|
| Logo/esporte | `volleyball` |
| Presenca: presente | `check` |
| Presenca: falta | `x` |
| Presenca: atraso | `clock` |
| Vitoria | `trophy` |
| Montar/reequilibrar | `shuffle` |
| Equilibrio | `scale` |
| Avaliacao +/- | `plus`, `minus` |
| Navegacao | `chevron-left`, `chevron-right` |
| Home | `house` |
| Historico | `history` |
| Alunos | `users` |
| Menu | `menu` |
| Adicionar aluno | `user-plus` |
| Filtro | `filter` |
| Busca | `search` |
| Calendario | `calendar`, `calendar-check` |
| Compartilhar | `share-2` |
| Editar | `pencil` |
| Excluir | `trash-2` |
| Configuracoes | `settings` |
| Filial | `building-2` |
| Turma | `users-round` |
| Iniciar treino | `play` |
| Registrar resultado | `flag` |
| Notificacao | `bell` |
| Estatisticas | `bar-chart-3` |
| Info | `info` |
| Alerta | `alert-triangle` |
| Desenvolvimento mode | `blend` |
| Foto | `camera` |
| Transferir | `arrow-left-right` |
| Arquivar | `archive` |
| Exportar | `file-down` |
| Backup | `cloud-upload` |
| Ajuda | `circle-help` |
| Sair | `log-out` |
| Senha | `key-round` |
| Grip (drag) | `grip-vertical` |
| Avaliar | `clipboard-list`, `clipboard-check` |
| Tendencia | `trending-up` |
| Download | `download` |
| Salvar resultado | `check` |
| Registro adicional | `plus` |
| Time A | `flame` |
| Time B | `anchor` |
| Sliders | `sliders-horizontal` |
| Lock | `lock` |
| Mapa | `map-pin`, `navigation` |
| Telefone | `phone` |
| Usuario | `user` |
| Aniversario | `cake` |
| Wifi/status | `signal`, `wifi`, `battery-full` |
| Tema escuro | `moon` |
| Idioma | `languages` |
| Regua | `ruler` |
| Poltrona | `armchair` |
| Expandir | `chevron-up`, `chevron-down` |

---

## 4. Mapeamento de Componentes (Atomic Design)

### 4.1 Atoms — shadcn/ui como base

| Componente Original | shadcn/ui Base | Adaptacao |
|---------------------|---------------|-----------|
| `Button` | `Button` | Variants: `primary` (bg green-500, shadow-cta), `secondary` (bg green-50, text green-700), `ghost` (bg card, shadow-sm), `dark` (bg ink-700), `warn` (bg warn-500), `destructive` (bg loss-500). Sizes: `md` (h-12 / 48px), `lg` (h-[58px]). Font: font-display font-bold. Rounded: rounded-md (12px). |
| `Field` / `Input` | `Input` + `Label` | Input: h-12 (48px), border-[1.5px] border-[--border-2], rounded-md, font-body. Focus: ring green-400 + border green-400. Label: font-body font-bold text-micro uppercase tracking-label text-[--fg-3]. |
| `Sheet` | `Sheet` (shadcn) | Bottom sheet mobile. Rounded-t-xl (22px). Grab bar 40x5px. Scrim bg ink-900/45. Animacao slide-up 280ms ease-out. |
| `Tabs` | `Tabs` (shadcn) | Container bg-[--bg-sunken] rounded-md p-1. Trigger h-10 rounded-[9px]. Active: bg-card shadow-sm. Font: font-display font-bold text-sm. |
| `ToggleSwitch` | `Switch` (shadcn) | Track: 48x28px. Thumb: 22x22px. On: bg green-500. Off: bg gray-300. Transicao thumb: ease-spring 200ms. |
| `Avatar` | `Avatar` (shadcn) | Circular, initials + deterministic color from nome. Tamanhos: 28, 32, 38, 40, 42, 64px. Font: font-display font-extrabold. Ring opcional (box-shadow). |
| `StatBadge` | `Badge` (shadcn custom) | Tones: `win` (bg win-bg, text win-700), `loss` (bg loss-bg, text loss-700), `neutral` (bg card, shadow-sm), `blue` (bg bal-bg, text bal-700). Numero: font-num font-black text-[19px] tabular-nums. |
| `Skeleton` | `Skeleton` (shadcn) | Padrao shadcn, animacao pulse. |

### 4.2 Molecules — shadcn + custom

| Componente Original | Tipo | Implementacao |
|---------------------|------|---------------|
| `Chip` | Custom | inline-flex, avatar(32) + nome + pos badge. Selected: bg green-500 text white. Rounded-pill. |
| `PresencaToggle` | Custom (segmented) | 3 opcoes em pill: Presente (bg win-500), Falta (bg loss-500), Atraso (bg warn-500). Container: bg-[--bg-sunken] rounded-pill p-[3px]. |
| `Stepper` | Custom | -/+ botoes circulares (40px) + valor central font-num font-black text-[22px]. Container: bg-[--bg-sunken] rounded-pill. |
| `Scale5` | Custom | 5 botoes quadrados 42x42px rounded-md. Selecionado: bg green-500 text white. Font: font-num font-extrabold. |
| `NivelTag` | Custom | Pill badge. Iniciante: bg bal-bg text bal-700. Intermediario: bg warn-bg text warn-700. Avancado: bg win-bg text win-700. |
| `Segmented` | Custom | Full-width segmented control. Container: bg-[--bg-sunken] rounded-[10px] p-[3px]. Active: bg green-500 text white. Font: font-body font-bold. |
| `EmptyState` | Custom | Centralizado. Icone em container 64x64 rounded-[20px] bg green-50. Titulo: font-display font-extrabold text-lg. Desc: text-[13.5px] text-[--fg-3]. CTA: Button padrao. |
| `PositionField` | Custom | Single-select (principal) + multi-select (alternativas). Chips com abbrev bold + nome. Selected: bg green-500 / alt: bg green-50 border green-400. |

### 4.3 Organisms — custom

| Componente Original | Implementacao |
|---------------------|---------------|
| `Header` | Sticky top. flex items-center gap-3. Titulo: font-display font-extrabold text-[26px]. Subtitulo: font-body text-[13px] text-[--fg-3]. Back button: 42x42 rounded-md bg-card shadow-sm. Slot right para acoes. |
| `BottomNav` | fixed bottom h-[78px] bg-card border-t border-[--border-1]. 4 tabs (Inicio/Historico/Alunos/Menu). Tab ativa: text green-600, stroke 2.4px. Label: font-body font-bold text-[10.5px]. z-20. |
| `PlayerCard` | Premium card. rounded-2xl (28px) p-5. Background: radial-gradient green -> ink-800 -> ink-900. Shadow: shadow-card. Sheen overlay. Rating: font-num font-black text-[52px] text yellow-400. Pos badge: bg yellow-400 rounded-pill. Attrs: grid 2-col, bars bg yellow-400. |
| `TeamPanel` | Card com header colorido. Time A: bg green-600. Time B: bg ink-700. Input nome time editavel. Roster: avatar(28) + nome + geral(font-num green-600). Footer: mini badges bg-[--bg-sunken]. |
| `BalanceIndicator` | Card bg-card rounded-lg shadow-md. Score percentage font-num font-black text-[22px]. Progress bar h-3 rounded-pill. Hint text. Modo Desenvolvimento: tier badges (topo/meio/base). Warning levantador. |
| `ResultCard` | Card bg-card rounded-lg shadow-md. Date: uppercase text-micro. Match: dois times + score central (font-num font-black text-[30px]). Winner: text win-700 + trophy icon. Sets: text-micro text-center. |
| `TurmaCard` | flex items-center gap-3.5 p-4 rounded-lg bg-card shadow-md. Dot icon: 46x46 rounded-[13px] bg green-50. Nome: font-display font-extrabold text-[17px]. Hora: font-num font-black text-[17px] text green-600. Selected: border-2 border green-500. |

### 4.4 Templates (layouts)

| Layout | Estrutura |
|--------|-----------|
| `MainLayout` | StatusBar (mock) + Screen (flex-1 overflow-y-auto) + BottomNav (fixed bottom). Body padding: 8px 18px 120px. |
| `DetailLayout` | Full-screen overlay (absolute inset-0 z-35+). Header com back button. Sem BottomNav. |
| `DarkHeaderLayout` | Header em bg ink-800 (perfil do aluno, partida detail). StatusBar light text. Tabs abaixo do header. |
| `ManagementLayout` | DetailLayout com back-stack navigation. Header + body scrollavel. |

---

## 5. Estados de Componentes

### Button

| Estado | Visual |
|--------|--------|
| Default | bg green-500, text white, shadow-cta |
| Hover (tablet) | opacity-95 |
| Active/pressed | scale-[0.97] + bg green-600 |
| Focus-visible | ring-2 ring-ring ring-offset-2 |
| Disabled | bg gray-100, text [--fg-4], shadow-none, cursor-not-allowed |
| Loading | Loader2 spin + texto ou so icone |

### Input / Field

| Estado | Visual |
|--------|--------|
| Default | border-[1.5px] border-[--border-2] |
| Focus | border-green-400 + shadow-[0_0_0_3px_var(--green-50)] |
| Erro | border-loss-500 + texto erro text-loss-500 text-sm + icon AlertCircle |
| Disabled | opacity-50 bg-muted cursor-not-allowed |

### PresencaToggle

| Estado | Visual |
|--------|--------|
| Pendente | bg transparent, text [--fg-3], sem icone |
| Presente | bg win-500, text white, icon check |
| Falta | bg loss-500, text white, icon x |
| Atraso | bg warn-500, text white, icon clock |

### Link / Nav Item (BottomNav)

| Estado | Visual |
|--------|--------|
| Default | text [--fg-4], stroke 2px |
| Active | text green-600, stroke 2.4px |
| Focus-visible | ring-2 ring-ring |

---

## 6. Interaction States (Tailwind)

```
Press/Active:     active:scale-[0.97] — em todos os botoes, cards tappaveis, chips
                  active:bg-green-600 — no primary button (darker fill)

Selected:         bg-green-500 text-white — chips, segmented, scale5, nav tabs
                  border-2 border-green-500 — turma card selecionada

Focus-visible:    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  Nunca outline:none sem substituto

Disabled:         opacity-50 pointer-events-none — universal
                  bg-gray-100 text-[--fg-4] shadow-none — botoes

Hover (tablet):   hover:bg-[--bg-sunken] — em rows tappaveis (er-prow, er-mrow)
```

---

## 7. Dark Theme Strategy

**Implementacao: Tailwind `darkMode: "class"`** — classe `.dark` no `<html>`.

O dark mode usa remapeamento de CSS variables (secao 2.7). Componentes usam APENAS tokens semanticos (`--background`, `--foreground`, `--card`, etc.), nunca cores hardcoded.

**Principios dark (extraidos do prototipo):**

| Aspecto | Light | Dark |
|---------|-------|------|
| App background | gray-50 (#F4F6FB) | #0B1422 |
| Card surface | white | #15203A |
| Raised surface | white | #1A2742 |
| Sunken surface | gray-100 | #1E2A47 |
| Green primary | #009C3B | #1FB85B (brighter) |
| Yellow accent | #FFCB00 | #F5C518 |
| Win green | #00913A | #2DD46E |
| Loss red | #E5484D | #FF6B6B |
| Warn orange | #F08C00 | #F5B450 |
| Balance blue | #1A3C92 | #5AA6FF |
| Shadows | Soft, low opacity | Quase invisiveis, surfaces diferem por contraste |
| Borders | Solid gray | rgba(255,255,255, 0.08-0.22) |
| Focus ring | green-400 | #2DD46E |

**Controle do tema (Configuracoes):**
- Opcoes: Claro / Escuro / Sistema
- "Sistema" segue `prefers-color-scheme`
- Persiste em `localStorage`
- Implementar com `next-themes` ou util proprio (set class `.dark` no `<html>`)

---

## 8. Wireframes Descritivos por Tela

### 8.1 Tela: Inicio (HomeScreen)

```
Mobile (390x844)
+-------------------------------------------+
| StatusBar (mock 9:41)                     | <- 50px, z-30
+-------------------------------------------+
| [Logo 34px] ESPORTE RECREACAO             | <- brandrow
| Header: "Bom treino, Tec. Marcos"        |
|          "Escolha a turma de hoje"   [bell]|
+-------------------------------------------+
| Suas turmas                    Ver todas > |
| +---------------------------------------+ |
| | [volleyball] Sub-17 Masc.     18:30   | | <- TurmaCard, selected: border green
| |              Filial Centro     Avanc. | |
| +---------------------------------------+ |
| | [volleyball] Sub-15 Fem.      16:00   | |
| |              Filial Norte      Inic.  | |
| +---------------------------------------+ |
|                                           |
| Resumo da semana                          |
| [3 treinos] [6 partidas] [92% presenca]   | <- StatBadge row
|                                           |
+-------------------------------------------+
| [ Iniciar treino                     ]    | <- Button lg full, sticky dock, z-20
+-------------------------------------------+
| [home] [historico] [alunos] [menu]        | <- BottomNav 78px, z-25
+-------------------------------------------+
```

**Hierarquia de componentes:**
- MainLayout > StatusBar + Screen + BottomNav
- Screen > BrandRow + Header(title, sub, right=IconButton bell) + Body
- Body > SectionTitle("Suas turmas") + TurmaCard[] + SectionTitle("Resumo") + StatBadge[]
- Dock(above-nav) > Button(lg, full, icon=play)

### 8.2 Tela: Chamada (ChamadaScreen)

```
+-------------------------------------------+
| [<] Chamada                               |
|     Sub-17 Masc. · hoje                   |
+-------------------------------------------+
| +---------------------------------------+ |
| |  11/14 confirmados                    | | <- counter: font-num font-black 30px
| +---------------------------------------+ |
|                                           |
| +---------------------------------------+ |
| | [Avatar] Lucas R.     [P | F | A]     | | <- CallRow + PresencaToggle
| |          Levantador                    | |
| +---------------------------------------+ |
| | [Avatar] Pedro S.     [P | F | A]     | |
| +---------------------------------------+ |
| | ... (14 rows)                         | |
+-------------------------------------------+
| [ Montar times · 11                  ]    | <- Button lg full, disabled se <4
+-------------------------------------------+
```

**Hierarquia:** DetailLayout > Header(back, title, sub) + CounterCard + CallRow[] + Dock(Button)

### 8.3 Tela: Montar Times (MontarScreen)

```
+-------------------------------------------+
| [<] Montar times               [shuffle]  |
|     12 em quadra · 2 no banco             |
+-------------------------------------------+
| +---------------------------------------+ |
| | [sliders] Opcoes de montagem          | |
| | [Competitivo | Desenvolvimento]       | | <- Segmented
| | [6x6 | 7x7]   [Banco | Rodizio]      | |
| +---------------------------------------+ |
|                                           |
| +---------------------------------------+ |
| | [scale] Times equilibrados    93%     | | <- BalanceIndicator
| | ============================          | |
| | Forca total e cada fund. divididos    | |
| +---------------------------------------+ |
|                                           |
| +-- Time A ---+  +-- Time B ---+        |
| | [flame]      |  | [anchor]     |       |
| | Guerreiros   |  | Leoes        |       | <- TeamPanel
| | [av] Lucas 87|  | [av] Pedro 81|       |
| | [av] Bruno 79|  | [av] Diego 75|       |
| | Geral 83 6j  |  | Geral 80 6j  |       |
| +--------------+  +--------------+       |
|                                           |
| Toque em um aluno para trocar de time     |
|                                           |
| Banco / rodizio                    2      |
| [chip] [chip]                             |
|                                           |
| [Reequilibrar]                            | <- Button secondary
+-------------------------------------------+
| [ Registrar resultado               ]    |
+-------------------------------------------+
```

### 8.4 Tela: Registrar Resultado (RegistrarResultadoScreen)

```
+-------------------------------------------+
| [<] Registrar resultado                   |
+-------------------------------------------+
| +---------------------------------------+ |
| | Guerreiros    1 x 2    Leoes          | | <- nomes editaveis, score font-num 30px
| +---------------------------------------+ |
|                                           |
| FORMATO                                  |
| [Set unico | Melhor de 3 | M5 | Tempo]  | <- Segmented
|                                           |
| PLACAR POR SET                            |
| +---------------------------------------+ |
| | SET 1   [-][25][+]  x  [-][21][+] [x] | | <- ScoreStep + remove
| | SET 2   [-][18][+]  x  [-][25][+] [x] | |
| | SET 3   [-][15][+]  x  [-][12][+] [x] | |
| +---------------------------------------+ |
| [+ Adicionar set]                         |
|                                           |
| VENCEDOR                                  |
| [Auto] [Guerr.] [Leoes] [W.O.A] [W.O.B] | <- chip selector
+-------------------------------------------+
| [ Salvar resultado                   ]    |
| [ Salvar e registrar outra partida   ]    |
+-------------------------------------------+
```

### 8.5 Tela: Historico (HistoricoScreen)

```
+-------------------------------------------+
| Historico                        [filter]  |
| Sub-17 Masculino                          |
+-------------------------------------------+
| [Todas] [Por turma] [Por aluno] [Maio]   | <- filter chips scroll-x
+-------------------------------------------+
| +---------------------------------------+ |
| | 28 MAI 2026                           | | <- ResultCard
| | Guerreiros     1 x 2     Leoes        | |
| | [trophy] ...        ...  [trophy]     | |
| | 25-21 · 18-25 · 12-15                | |
| +---------------------------------------+ |
| +---------------------------------------+ |
| | 25 MAI 2026                           | |
| | Feras          2 x 0     Titãs        | |
| +---------------------------------------+ |
+-------------------------------------------+
```

**Estado vazio:** EmptyState(icon=volleyball, title="Sem partidas ainda", desc="Monte os times e registre o resultado para comecar o historico.")

### 8.6 Tela: Detalhe da Partida (PartidaDetailScreen)

```
+-------------------------------------------+
| StatusBar (light text)                    |
| [<-] Detalhe da partida      [share]     | <- DarkHeaderLayout, bg ink-800
+-------------------------------------------+
| [ResultCard hero — cursor default]        |
|                                           |
| Set a set                                 |
| +---------------------------------------+ |
| | SET 1  Guerreiros  25 x 21  Leoes     | |
| | SET 2  Guerreiros  18 x 25  Leoes     | |
| | SET 3  Guerreiros  12 x 15  Leoes     | |
| +---------------------------------------+ |
|                                           |
| Como os times foram montados             |
| [BalanceIndicator com barras de forca]    |
|                                           |
| Elencos completos                         |
| Time A (Guerreiros) - Vitoria             |
| [chip] [chip] [chip LEV] ...             |
| Time B (Leoes) - Derrota                  |
| [chip] [chip] ...                         |
|                                           |
| Acoes                                     |
| [Editar resultado]                        |
| [Corrigir elenco] [Compartilhar]          |
| [Ver avaliacoes desse treino]             |
| [Excluir partida] (text loss-500)         |
+-------------------------------------------+
```

**Acao destrutiva:** Sheet com confirmacao. "Excluir partida?" + descricao + Button destructive full + Button ghost Cancelar.

### 8.7 Tela: Alunos (AlunosScreen)

```
+-------------------------------------------+
| Alunos                        [user-plus]  |
| Sub-17 Masculino · 14                     |
+-------------------------------------------+
| +---------------------------------------+ |
| | [search] Buscar aluno...              | | <- input estilizado como callrow
| +---------------------------------------+ |
|                                           |
| +---------------------------------------+ |
| | [Avatar] Lucas Ribeiro    87    [>]   | | <- CallRow, geral font-num 22px green-600
| |          Levantador · 8V 3D          | |
| +---------------------------------------+ |
| | [Avatar] Pedro Santos    81    [>]   | |
| |          Ponteiro · 6V 5D           | |
| +---------------------------------------+ |
| | ... (ordenados por geral desc)       | |
+-------------------------------------------+
```

### 8.8 Tela: Perfil do Aluno (AlunoDetailScreen)

```
+-------------------------------------------+
| StatusBar (light text)                    |
| [<-] Perfil do aluno         [share]     | <- DarkHeaderLayout
+-------------------------------------------+
| [Dados | Desempenho]                      | <- Tabs, bg ink-800
+-------------------------------------------+

*** Tab Desempenho: ***
| [PlayerCard premium — full width]         | <- bg ink-800
|                                           |
| [8V vitorias] [3D derrotas] [73% apr] [89% pres] |
|                                           |
| Evolucao · 7 treinos                     |
| [BarChart simples — ultimo bar green]     |
|                                           |
| Partidas recentes              Ver tudo > |
| [V] Guerreiros x Leoes — 28 mai — 3 sets |
| [D] Feras x Titas — 25 mai — 2 sets      |

*** Tab Dados: ***
| [Avatar 64px] [Trocar foto]              |
| Nome completo: Lucas Ribeiro             |
| Nascimento: 12/03/2010  Genero: Masc.   |
| Altura: 178 cm   Mao: Destro            |
| Posicao principal: [LEV] [PON] [OPO]... |
| Tambem joga como: [CEN] [LIB]           |
| Turma: Sub-17 Masc.   Entrada: mar/2024 |
| Contato: (11) 99876-5432 Sandra (mae)   |
| [Transferir de turma]                     |
| [Arquivar aluno]                          |
```

**Amostra insuficiente (<5 jogos):** Card de info com icone warn-500 + texto "Amostra insuficiente. Jogue mais treinos para liberar notas confiaveis." Substitui o bloco de stats.

### 8.9 Tela: Compartilhar (ShareScreen)

```
+-------------------------------------------+
| [<-] Compartilhar                         |
+-------------------------------------------+
| [Preview da ShareCard centralizada]       | <- bg-sunken area
|                                           |
| FORMATO                                  |
| [quadrado | vertical | paisagem]          |
|                                           |
| O QUE INCLUIR (so para partida)          |
| Elencos              [switch]             |
| Placar set a set     [switch]             |
| Indice de equilibrio [switch]             |
|                                           |
| TEMA                                     |
| [Verde] [Escuro] [Claro]                 | <- 3 botoes com preview bg
+-------------------------------------------+
| [Salvar]     [Compartilhar]               |
+-------------------------------------------+
```

### 8.10 Tela: Avaliacoes do Treino (AvaliacoesScreen)

```
+-------------------------------------------+
| [<-] Avaliacoes                           |
|      Treino de 28/05/2026 · Sub-17 Masc. |
+-------------------------------------------+
| [partida context card com "Ver partida"]  |
|                                           |
| [14 presentes] [12 avaliados] [8 ajustes] |
|                                           |
| Presentes                                 |
| +---------------------------------------+ |
| | [Av] Lucas     [^Rec] [^Atq]     4   | | <- ajustes tags + engajamento
| |                                  ENGAJ.| |
| +---------------------------------------+ |
| | [Av] Pedro     Sem ajustes       3   | |
| +---------------------------------------+ |
| | [Av] Diego     Presente · nao avaliado  [Avaliar] | |
| +---------------------------------------+ |
+-------------------------------------------+
| [ Completar avaliacoes              ]     |
+-------------------------------------------+
```

**Estado vazio:** EmptyState(icon=clipboard-list, title="Ninguem avaliado neste treino", cta="Avaliar treino").

### 8.11 Tela: Avaliar Aluno (AvaliarAlunoScreen)

```
+-------------------------------------------+
| [<-] [Avatar 42] Lucas Ribeiro            |
|                  Treino 28/05/2026        |
+-------------------------------------------+
| FUNDAMENTOS TECNICOS    ajuste · estavel  |
| +---------------------------------------+ |
| | Saque              [1] [2] [3] [4] [5]| | <- Scale5, com tag se mudou
| | Recepcao    ^de 3   [1] [2] [3] [4] [5]| |
| | Levantamento       [1] [2] [3] [4] [5]| |
| | Ataque             [1] [2] [3] [4] [5]| |
| | Bloqueio           [1] [2] [3] [4] [5]| |
| | Defesa             [1] [2] [3] [4] [5]| |
| +---------------------------------------+ |
|                                           |
| ENGAJAMENTO DO DIA     volatil · ENGAJ.  |
| +---------------------------------------+ |
| | Nota geral do dia       [Detalhar v]  | |
| | [1] [2] [3] [4] [5]                   | |
| |                                        | |
| | (expandido: sub-criterios soft)        | |
| +---------------------------------------+ |
|                                           |
| OBSERVACAO DO DIA · opcional              |
| [textarea]                                |
+-------------------------------------------+
| [Salvar]    [Salvar e proximo]            |
+-------------------------------------------+
```

### 8.12 Tela: Menu (MenuScreen)

```
+-------------------------------------------+
| Menu                                      |
+-------------------------------------------+
| +---------------------------------------+ |
| | [building-2] Filiais         [>]      | | <- er-mrow
| |              Gerencie suas unidades   | |
| +---------------------------------------+ |
| | [users-round] Turmas         [>]      | |
| |               Turmas e horarios       | |
| +---------------------------------------+ |
| | [users] Alunos               [>]      | |
| |         Cadastro e perfis             | |
| +---------------------------------------+ |
| | [bar-chart-3] Fundamentos   [>]      | |
| |               Configurar avaliacao    | |
| +---------------------------------------+ |
| | [settings] Configuracoes    [>]      | |
| |            Conta e preferencias       | |
| +---------------------------------------+ |
+-------------------------------------------+
```

### 8.13 Tela: Filiais (FiliaisScreen + FilialDetailScreen)

```
Lista:
| [<] Filiais                        [+]   |
| [building-2] Filial Centro    [>]         |
|              Sao Paulo · 2 turmas · 20 al |
| [building-2] Filial Norte     [>]         |

Detalhe (modo view):
| [<] Filial Centro              [Editar]  |
| +---------------------------------------+ |
| | [building-2] Nome: Filial Centro      | | <- InfoRow
| | [map-pin] Cidade: Sao Paulo · Centro  | |
| | [navigation] Endereco: Rua X, 123     | |
| | [phone] Telefone: (11) 1234-5678      | |
| | [user] Responsavel: Marcos            | |
| +---------------------------------------+ |
|                                           |
| Turmas desta filial · 2                   |
| [er-mrow] Sub-17 Masc.                   |
| [er-mrow] Sub-15 Fem.                    |
| [+ Nova turma]                            |
|                                           |
| Acoes                                     |
| [Arquivar filial]                         |
| [Excluir filial] (locked se tem turmas)   |

Detalhe (modo edicao): Fields editaveis no lugar dos InfoRow.
Nova filial: Mesmo layout que edicao, titulo "Nova filial".
```

**Regra de negocio:** Filial com turmas ativas nao pode ser excluida — botao fica em fg-4 + explicacao com icone lock.

### 8.14 Tela: Turmas (TurmasScreen + TurmaDetailScreen)

```
Lista:
| [<] Turmas                         [+]   |
| [Todas] [Filial Centro] [Filial Norte]   | <- filter chips
| [users-round] Sub-17 Masc.        [>]    |
|               Filial Centro · Seg/Qua    |
|               [Avancado] 14 alunos       |

Detalhe (modo view):
| [<] Sub-17 Masculino            [Editar]  |
| InfoRows: Turma, Filial, Dias/horario,   |
|           Nivel, Faixa, Professor         |
| Alunos matriculados · 14     + Adicionar  |
| [chips com x para remover]                |
| [Iniciar treino] (Button lg primary)      |
| [Arquivar turma]                          |
| [Excluir turma]                           |
```

### 8.15 Tela: Fundamentos (FundamentosScreen)

```
| [<] Fundamentos                           |
|     Configurar avaliacao                  |
+-------------------------------------------+
| [info] Define o que aparece na Avaliacao  |
|        rapida e no equilibrio dos times.  |
|                                           |
| ESCALA DE AVALIACAO                       |
| [1 a 3 | 1 a 5 | 1 a 10]                |
|                                           |
| TECNICOS           Mostrar pesos [switch] |
| +---------------------------------------+ |
| | [grip] Saque            x1.0  [on]    | | <- drag handle + label + peso + switch
| | [grip] Recepcao         x1.0  [on]    | |
| | [grip] Levantamento     x1.5  [on]    | |
| | [grip] Ataque           x1.0  [on]    | |
| | [grip] Bloqueio         x0.8  [on]    | |
| | [grip] Defesa           x1.0  [on]    | |
| +---------------------------------------+ |
|                                           |
| COMPORTAMENTAIS                           |
| | [grip] Comunicacao             [on]    | |
| | [grip] Lideranca               [off]   | |
|                                           |
| [+ Adicionar fundamento]                  |
```

### 8.16 Tela: Configuracoes (ConfigScreen)

```
| [<] Configuracoes                         |
|     Conta e preferencias                  |
+-------------------------------------------+
| CONTA                                     |
| [Avatar] Prof. Marcos Silva       [>]     |
|          marcos@email.com                 |
| [key] Trocar senha                [>]     |
| [log-out] Sair (text loss-500)            |
|                                           |
| PREFERENCIAS DO APP                       |
| [languages] Idioma          Portugues     |
| [moon] Tema    [Claro | Escuro | Sistema] |
| [ruler] Unidade de altura    [cm | pol]   |
|                                           |
| PREFERENCIAS DE TREINO                    |
| [users] Tamanho do time     [6x6 | 7x7]  |
| [armchair] Tratar sobra     Banco/rodizio |
| [scale] Modo de montagem                  |
|   [Competitivo | Desenvolvimento]         |
|                                           |
| DADOS                                     |
| [file-down] Exportar dados (CSV)   [>]   |
| [cloud-upload] Backup              [>]   |
|                                           |
| SOBRE                                     |
| [circle-help] Ajuda                [>]   |
| [info] Sobre o app                v1.0   |
```

---

## 9. Telas de Erro

### 404 — Pagina nao encontrada

- Layout: centralizado, sem nav
- Icone: lucide `volleyball` (64px, text-[--fg-4])
- Titulo: "Pagina nao encontrada" (font-display font-extrabold text-xl)
- Descricao: "O conteudo que voce procura nao existe ou foi movido." (text-[--fg-3])
- Acao: Button primary -> "Voltar ao inicio" (link para /)

### 500 — Erro interno

- Layout: centralizado, sem nav
- Icone: lucide `alert-triangle` (64px, text-loss-500/70)
- Titulo: "Algo deu errado"
- Descricao: "Ocorreu um erro inesperado. Tente novamente."
- Acao: Button primary -> "Tentar novamente" (reload) + Button ghost -> "Voltar ao inicio"

### Error Boundary (React)

- Wrapper em todas as rotas principais
- Captura erros de renderizacao sem derrubar o app
- Exibir tela 500 como fallback

---

## 10. Comportamento Responsivo

O app e **mobile-first com canvas base 390x844** (iPhone 14-class). O comportamento responsivo e minimo — e um app mobile-first que pode ser acessado em tablets, mas nao ha layout desktop separado.

| Componente | Mobile (<640px) | Tablet (640-1024px) |
|---|---|---|
| Layout geral | Coluna unica, gutters 18px | Coluna unica mais larga, gutters 24px, max-w-lg centralizado |
| BottomNav | Fixed bottom 78px | Fixed bottom 78px |
| TeamPanels | Grid 2-col (grid-cols-2 gap-3) | Grid 2-col com mais espaco |
| PlayerCard | Full width dentro do container | max-w-sm centralizado |
| Cards (turma, result) | Full width | Full width ate max-w |
| Sheets | Full width bottom | Full width bottom, max-h-[80%] |
| Modais de confirmacao | Sheet bottom | Sheet bottom (mesmo padrao) |

---

## 11. Estrategia de Loading

| Tipo de conteudo | Padrao | Motivo |
|---|---|---|
| Lista de turmas (home) | Skeleton cards (3 placeholders) | Mantem layout, evita CLS |
| Lista de alunos (chamada, alunos) | Skeleton rows | Shape previsivel |
| KPIs / StatBadges | Skeleton pills | Tamanho fixo |
| PlayerCard | Skeleton retangular 28px radius | Area grande, shape unico |
| Graficos (evolucao) | Skeleton retangular + pulse | Area variavel |
| Acoes de botao (submit, delete) | Button disabled + Loader2 spin | Feedback imediato, evita double-submit |
| Historico de partidas | Skeleton ResultCards (2 placeholders) | Layout previsivel |
| Troca de tela/rota | Skeleton do layout da tela destino | Mantem contexto visual |
| Compartilhar (gerar imagem) | Overlay scrim + spinner + "Gerando imagem..." | Operacao longa, feedback quantitativo |

**Regra geral:** Skeleton quando shape e previsivel. Spinner apenas em acoes de botao ou overlays de operacao longa.

---

## 12. Estados de UI por Tela

### Inicio (Home)

| Estado | Comportamento |
|--------|--------------|
| Loading | Skeleton cards na area de turmas. StatBadges skeleton. BrandRow e Header renderizam imediatamente. |
| Empty (sem turmas) | EmptyState: icon=volleyball, "Nenhuma turma ainda. Crie sua primeira turma para comecar." + Button "Criar turma" |
| Erro de rede | Toast sonner: "Erro ao carregar turmas. Tente novamente." |
| Turma selecionada | border-2 border-green-500 na TurmaCard. Botao dock: "Iniciar treino" habilitado. |
| Nenhuma selecionada | Botao dock: "Selecione uma turma", disabled. |

### Chamada

| Estado | Comportamento |
|--------|--------------|
| Loading | Skeleton rows (14 placeholders) |
| < 4 presentes | Botao dock disabled: "Marque ao menos 4" |
| >= 4 presentes | Botao dock habilitado: "Montar times · N" |

### Montar Times

| Estado | Comportamento |
|--------|--------------|
| Equilibrado (>=80%) | BalanceIndicator verde, icone scale, "Times equilibrados" |
| Desequilibrado (<80%) | BalanceIndicator warn-500, icone alert-triangle, "Pode melhorar" + hint |
| Modo Desenvolvimento | BalanceIndicator com tier badges (topo/meio/base) por time |
| Sem levantador | Warning orange com icone alert-triangle |
| Banco vazio | Secao "Banco / rodizio" oculta |

### Historico

| Estado | Comportamento |
|--------|--------------|
| Loading | Skeleton ResultCards |
| Empty | EmptyState: icon=volleyball, "Sem partidas ainda" |
| Com dados | Lista de ResultCards, filtros horizontais |

### Perfil do Aluno — Tab Desempenho

| Estado | Comportamento |
|--------|--------------|
| Amostra insuficiente (<5 jogos) | Card info warn-500: "Amostra insuficiente. Jogue mais treinos para liberar notas confiaveis." No lugar do bloco de stats. PlayerCard mostra mas com nota baixa. |
| Com dados suficientes | PlayerCard + StatBadges + grafico evolucao + partidas recentes |

### Acoes Destrutivas (todas as telas)

| Acao | Comportamento |
|------|--------------|
| Excluir partida | Sheet: "Excluir partida?" + desc irreversibilidade + Button destructive full + Button ghost Cancelar |
| Excluir filial | Sheet: "Excluir filial?" + desc. Locked se tem turmas ativas (botao fg-4 + texto + icone lock) |
| Excluir turma | Sheet: "Excluir turma?" + desc irreversibilidade |
| Sair | Direto (sem confirmacao no prototipo, mas recomenda-se Sheet) |

---

## 13. Mapa de Navegacao

```
/ (Home — tab inicio)
|-- Iniciar treino (requer turma selecionada)
|   |-- /chamada
|   |   |-- /montar-times
|   |       |-- /registrar-resultado
|   |       |-- /registrar-resultado (edit mode)
|
|-- /historico (tab historico)
|   |-- /historico/:id (detalhe da partida)
|       |-- /historico/:id/compartilhar
|       |-- /historico/:id/avaliacoes
|           |-- /historico/:id/avaliacoes/:alunoId (avaliar aluno individual)
|       |-- /historico/:id/editar (registrar resultado em edit mode)
|
|-- /alunos (tab alunos)
|   |-- /alunos/:id (perfil — tabs Dados/Desempenho)
|       |-- /alunos/:id/compartilhar
|
|-- /menu (tab menu)
    |-- /filiais
    |   |-- /filiais/:id (detalhe view/edit)
    |   |-- /filiais/nova
    |-- /turmas
    |   |-- /turmas/:id (detalhe view/edit)
    |   |-- /turmas/nova
    |-- /fundamentos
    |-- /configuracoes

Rotas de erro (fora do layout principal):
|-- /404 (catch-all *)
|-- /500 (via Error Boundary)
```

**Navegacao:**
- BottomNav: 4 tabs (inicio, historico, alunos, menu) — navegacao principal
- Management (Menu): back-stack com push/pop — Header com botao voltar
- Overlays (Sheet): scrim + slide-up — para confirmacoes e acoes rapidas
- Detail screens: full-screen overlay (z-35+) — perfil aluno, detalhe partida, compartilhar, avaliacoes

---

## 14. Complementos Aprovados

| Lib | Justificativa |
|-----|---------------|
| **Vaul** | Drawer/bottom sheet mobile — Sheet do prototipo usa exatamente este padrao (slide-up com grab bar, scrim, animacao spring). Alternativa: shadcn Sheet ja cobre, mas Vaul tem melhor UX touch. |

> Nota: O app nao tem dashboards data-heavy nem tabelas complexas, portanto Tremor e TanStack Table NAO sao necessarios. cmdk tambem nao — sem busca global / command palette. Recharts pode ser usado para o grafico de evolucao (bar chart simples).

---

## 15. Mobile-First

- **Canvas base:** 390x844 (iPhone 14-class)
- **Content gutters:** 18px laterais (padding-x), 8px top
- **Touch target minimo:** 48px (todos os botoes, toggles, chips, nav tabs)
- **Thumb zone:** Acoes primarias SEMPRE no dock fixo inferior (bottom bar). Botao CTA: h-[58px] full-width.
- **Bottom nav:** 78px fixed. Espaco entre bottom-nav e dock: 14px.
- **Safe area:** padding-bottom com `env(safe-area-inset-bottom)` nos docks e nav.
- **Scroll:** `-webkit-overflow-scrolling: touch`, scrollbar oculta.
- **One-handed use:** Header com info, acoes sempre embaixo. Sheets abrem por baixo.
- **Dados na chamada (14 alunos):** rows com 48px+ de altura, toggle de presenca 36px de altura com area de toque generosa.

---

## 16. Regras de Acessibilidade (WCAG 2.1 AA)

- **Contraste:** verde-500 sobre branco = 4.6:1 (AA). Amarelo-400 sobre ink-800 = 10.8:1. Loss-500 sobre branco = 4.5:1.
- **Cor nunca unica:** Presenca usa cor + icone + texto (check/x/clock). Resultado usa cor + icone trophy + texto V/D.
- **Focus-visible:** ring-2 ring-green-400 ring-offset-2 em todos os interativos. Nunca `outline: none` sem substituto.
- **Touch targets:** minimo 48x48px em mobile. Stepper botoes 40x40 (com padding atinge 48). Scale5 botoes 42x42.
- **ARIA:** `aria-label` em botoes icon-only (voltar, compartilhar, sino, filtro). `aria-pressed` no ToggleSwitch. `role="tablist"` nos Tabs.
- **Keyboard nav:** Tab percorre na ordem logica. Esc fecha sheets. Enter/Space ativa botoes.
- **Icones decorativos:** `aria-hidden="true"`.
