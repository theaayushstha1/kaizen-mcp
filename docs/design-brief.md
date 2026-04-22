# Kaizen — Frontend Design Handoff

Paste this whole file into a fresh Claude Design session. It is self contained. You do not need the repo to design against this brief.

---

## 1. Product in one paragraph

Kaizen is a single page web app where someone opens a URL and starts chatting with an AI analyst about a real indie app called Dark Noise. The agent pulls live numbers from the RevenueCat Charts API, narrates what it finds, and flags periods that are still settling. Zero install, zero signup. The whole experience is one chat page plus a few quiet support pages. Editorial feel, not dashboard.

Tagline used on the page:

> An AI analyst for the RevenueCat Charts API.

Required attribution line, shown in the footer on every page:

> Built by Kaizen, an AI agent. Operated by Aayush Shrestha.

## 2. Current implementation problems to fix

A working prototype already exists. These are the exact issues in the latest screenshot, in priority order:

1. **Markdown is not rendering.** Double asterisks are visible in the agent reply (`**January 2026**`, `**February 2026**`). The replacement UI must render markdown (bold, lists, inline code, links) using a small renderer. No HTML soup.
2. **Tool call chips are too loud.** Right now every chip is a full width grey block with raw JSON args on the page. They dominate the answer. Redesign so chips are secondary, collapsible, and visually subordinate to the prose.
3. **No visual hierarchy between user and agent turns.** Both sit in the same grey panel with tiny all caps labels. Turns blend together.
4. **Zero motion.** The page is completely static. Streaming responses appear as if teleported. Tool chips snap in.
5. **Header is cramped and all the same weight.** "KAIZEN / DARK NOISE" tracking is weak and the hero line touches the label line.
6. **Input bar is forgettable.** Full width rounded pill with a grey Ask button. No state communication, no focus personality.
7. **Whitespace budget is off.** Panel padding is tight. Prose runs edge to edge. No breathing room between turns.

Fix all seven.

## 3. Mood and reference points

Aim for the intersection of:

- Stripe documentation (typographic restraint, generous line height, quiet rules)
- Linear changelog (editorial dividers between sections, mono for metadata)
- Vercel reader mode (clean sans for prose, mono for code and tool calls)
- Apple Notes on Liquid Glass (soft light, not stark white)

Do NOT aim for:

- ChatGPT style grey bubbles
- Notion style dense sidebars
- Datadog style data dashboards
- Any gradient, glow, or glassmorphism

The product is calm. The agent is the loud part, not the chrome.

## 4. Palette (firm)

Only three color families on the page. Grey, light green, white. No blue, no purple, no red except for one reserved error token.

| Token | Hex | Usage |
| --- | --- | --- |
| `paper` | `#fafaf7` | Page background. Slightly warm so pure white UI elements feel like floating paper. |
| `surface` | `#ffffff` | Cards, chat panel, composer. Sits on top of paper with a 1px border. |
| `line` | `#e6e6e1` | All borders and hairline dividers. 1px, never thicker. |
| `line-strong` | `#d4d4cd` | Input border on focus state. |
| `ink` | `#14181a` | Primary text and primary button fill. Near black, not pure. |
| `ink-muted` | `#6c7075` | Secondary text, timestamps, meta labels. |
| `ink-whisper` | `#9ea1a6` | Placeholder text, disabled states, tool chip parens. |
| `sage` | `#6b8f71` | The only chromatic color. Use for agent label, focus ring, tool name, status dot, link underline on hover. |
| `sage-soft` | `#e8efe6` | Agent turn background. Very light green tint, almost imperceptible. |
| `rust` | `#a8533a` | Reserved for error states only. Do not use anywhere else. |

Tailwind extension block to hand back:

```ts
// tailwind.config.ts theme.extend.colors
colors: {
  paper: '#fafaf7',
  surface: '#ffffff',
  line: { DEFAULT: '#e6e6e1', strong: '#d4d4cd' },
  ink: { DEFAULT: '#14181a', muted: '#6c7075', whisper: '#9ea1a6' },
  sage: { DEFAULT: '#6b8f71', soft: '#e8efe6' },
  rust: '#a8533a',
},
```

## 5. Typography

- **Sans**: system stack, no web fetch: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Mono**: system mono: `ui-monospace, "SF Mono", Menlo, monospace`.
- **Serif**: none. Do not pull a web serif for the hero.

Type scale (Tailwind classes in parens):

| Role | Size / leading | Weight | Tracking | Case |
| --- | --- | --- | --- | --- |
| Eyebrow label | 11 / 16 (`text-[11px]`) | 500 | `tracking-[0.16em]` | uppercase |
| Hero | 30 / 36 (`text-3xl`) | 600 | `tracking-tight` | sentence |
| Sub hero | 15 / 22 (`text-[15px]`) | 400 | default | sentence |
| Prose | 15 / 26 (`text-[15px] leading-[26px]`) | 400 | default | sentence |
| Agent label | 11 / 14 | 500, `sage` | `tracking-[0.18em]` | uppercase |
| User label | 11 / 14 | 500, `ink-muted` | `tracking-[0.18em]` | uppercase |
| Tool chip | 11 / 16 mono | 500 | default | lowercase |
| Meta timing | 11 / 14 mono | 400, `ink-whisper` | default | lowercase |

Body line length must cap at 68 characters (`max-w-[62ch]`) so longer agent answers read like an essay, not a log.

Markdown rules for agent prose:

- `**bold**` renders as `font-semibold text-ink` (no extra color).
- `*italic*` renders as italic, not color shifted.
- `code` inline renders in mono, 12.5px, `bg-paper` pill with 4px horizontal padding and 2px vertical, `rounded`, `text-ink`.
- Lists: `ul` becomes a flush, no bullet set; prepend a custom 6px sage square marker at the 1em mark. `ol` uses regular numerals in `ink-muted`.
- Links: `text-ink` underline `underline-offset-4 decoration-line` by default, hover turns both text and underline `sage`.
- Block quotes are out of scope.
- `pre` blocks are out of scope for agent replies. Keep code inline only.

## 6. Layout and spacing

One page, one column, centered. Total content max width `max-w-[720px]` on desktop, `max-w-full` with 24px side padding on mobile.

Vertical rhythm on home page, top to bottom:

1. 40px top padding
2. Header strip (height 28px)
3. 28px gap
4. Hero block (title 36px line + 8px gap + sub hero 22px line) = approx 70px
5. 36px gap
6. Chat panel (flex grows to fill, min height 540px on desktop)
7. 20px gap
8. Composer (height 52px)
9. 24px gap
10. Footer (height 20px)
11. 40px bottom padding

Chat panel internal padding: 28px top and bottom, 32px left and right. Between turns: 24px. Inside a turn, between label and content: 8px. Between content and tool chip group: 12px.

Global page background is `paper`. Chat panel background is `surface`. Composer background is `surface`. Footer text sits directly on `paper` with no container.

Radii:

- Chat panel: `rounded-[20px]`
- Composer input: `rounded-full`
- Composer button: `rounded-full`
- Tool chip: `rounded-md`
- Suggested question chip: `rounded-full`
- Inline code pill: `rounded`

Shadows are minimal. One elevation token only:

```css
shadow-[0_1px_2px_rgba(20,24,26,0.04),0_8px_24px_-12px_rgba(20,24,26,0.06)]
```

Apply to chat panel and composer. Nothing else gets a shadow.

Borders are always 1px solid `line`. Focus borders are 1px solid `sage` plus a 3px `sage-soft` glow ring.

## 7. Screens to design

### 7.1 Home / chat (primary, 90 percent of effort)

Wireframe spec from top to bottom.

**Header strip**

- Left cluster, vertically centered: a 6px solid `sage` dot, 6px gap, the word `Kaizen` in 13px semibold `ink`, 10px gap, a 10px vertical rule in `line`, 10px gap, `Dark Noise` in 12px `ink-muted`.
- Right cluster, same row: a mono pill reading `cache 12s` with a small sage dot, 10px horizontal padding, 4px vertical, `bg-paper`, `text-ink-whisper`. This pill is the only live status indicator. It ticks every second using GSAP.

**Hero block**

- Line 1: `An AI analyst for the RevenueCat Charts API.` at 30px, 600 weight, tight tracking, `ink`. No period at end in mockups is fine but keep the period in code.
- Line 2: `Ask about Dark Noise's unit economics. Incomplete periods are flagged in every answer.` at 15px, `ink-muted`.

**Chat panel**

- `rounded-[20px]` `bg-surface` `border border-line` with the elevation token above.
- On empty state, render a single centered block:
  - 11px eyebrow in `ink-whisper`, `tracking-[0.18em]`, uppercase: `TRY ONE`.
  - 16px gap.
  - Four suggested question chips laid out as a single wrap row, 8px horizontal gap, 8px vertical gap.
  - Chip: `rounded-full`, `border border-line`, 10px horizontal padding, 6px vertical, 13px sans in `ink`, `bg-paper`. Hover: border turns `sage`, text turns `sage`, no background change. Transition 150ms ease out.
  - Suggested questions:
    1. How is Dark Noise doing right now
    2. Show MRR for the last 30 days
    3. Break down MRR by store this quarter
    4. What is the trial conversion rate

**User turn**

- Full width of the panel.
- Top row: eyebrow `YOU` in `ink-muted`.
- 8px gap, then the user's message in 15px `ink`, 26px line height. Never boxed, never bubbled.
- Right aligned text is NOT used. Keep user turns left aligned for reading rhythm but visually distinguish via the label only.

**Agent turn**

- Entire turn container gets `bg-sage-soft` with `rounded-2xl`, 20px padding top and bottom, 24px padding left and right.
- Eyebrow `KAIZEN` in `sage`.
- 8px gap, then rendered markdown prose. 15px, 26px line height. Bold renders real bold.
- If tool calls happened for this turn, they appear BELOW the prose inside a collapsible panel titled `Show reasoning trace` in mono 11px `ink-muted` with a 12px chevron. By default collapsed if more than one tool call; expanded if exactly one. On hover the title turns `sage`.
- Inside the expanded trace:
  - Each call renders as a single line tool chip, not a full block.
  - Chip layout: mono 11px, `text-ink-muted`. Tool name in `sage`. Parens in `ink-whisper`. Args collapsed to a truncated JSON one liner, max 56 characters, overflow ends with a soft ellipsis and a small arrow that expands the args below on click.
  - After the closing paren, a 12px gap, then state indicator. Running: three tiny pulsing dots in `sage`, 4px apart, each 220ms pulse, staggered 80ms. Done: `ok 412ms` in `ink-whisper` mono.
- Rows in the trace are 28px tall, 10px vertical gap between rows. No borders between rows.

**Composer**

- Full width of the column.
- Wrapper is a row with 12px gap.
- Input: `rounded-full`, `border border-line`, `bg-surface`, 44px height, 18px left padding, 16px right padding. Placeholder: `Ask about Dark Noise's revenue, trials, churn` in `ink-whisper`. Focus: border becomes `sage` and a 3px `sage-soft` ring sits outside the border.
- Button: 44 by 44 circle, `bg-ink`, icon-free, the word `Ask` in 13px 500 white. Hover: `bg-sage`. Disabled: 40 percent opacity, `cursor-not-allowed`. Active press: scale 0.97 for 80ms.

**Footer**

- One line, 12px, `ink-whisper`. Copy:

  `Built by Kaizen, an AI agent. Operated by Aayush Shrestha.`

  `Aayush Shrestha` is a link to GitHub, default `ink`, hover `sage`.
- Right side, same line, four mono micro links separated by middle dots: `github`, `blog`, `demo`, `scorecard`. Each is 11px mono `ink-muted`, hover `sage`, underline on hover only.

### 7.2 /demo page

Same chrome as 7.1. Replace live agent calls with a prerecorded session. Add a 11px mono pill next to the header cache pill reading `demo replay` in `ink-whisper`. Autoplay on load, token by token, using the exact GSAP timeline described in section 9. A small mono control at top right of the chat panel reads `skip`, clickable, which finishes the replay instantly.

### 7.3 /blog/your-agent-is-a-customer-now

Single column article layout. Same header as home page but the right cluster shows `reading 9 min` instead of the cache pill. Article width `max-w-[640px]`. Prose styles same as agent turn prose. Code blocks allowed here as full width `pre` in mono 13px with `bg-paper` and `rounded-xl`. No sidebar, no TOC on desktop. At the bottom a `/` divider line then the same footer as home. A persistent, small floating return button bottom left on scroll past 200px, circular, `bg-ink`, 32 by 32, label `back` in 11px white mono, hover turns `bg-sage`.

## 8. Component specs (reusable)

- `EyebrowLabel` props: `tone` (`muted` default, `sage`), children.
- `SuggestedChip` props: `label`, `onClick`.
- `ToolChip` props: `name`, `args` (object), `state` (`running` or `done`), `ms` (number when done).
- `CachePill` props: `ageSeconds`.
- `Turn` props: `role` (`user` or `agent`), `content` (ReactNode), `toolCalls` (array).
- `Composer` props: `value`, `disabled`, `onChange`, `onSubmit`.
- `Footer` static.

All components receive only primitive props. No context wiring needed in the design.

## 9. Motion spec (GSAP)

Use GSAP 3 with `@gsap/react` for `useGSAP` hook. One shared GSAP context per screen. All tweens use `ease: 'power2.out'` unless noted. All durations in seconds.

```
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
```

### 9.1 Page enter

On mount of the home page:

1. Header strip: opacity 0 to 1, y -4 to 0, duration 0.35.
2. Hero title: opacity 0 to 1, y 8 to 0, duration 0.5, delay 0.08.
3. Sub hero: opacity 0 to 1, y 6 to 0, duration 0.5, delay 0.16.
4. Chat panel: opacity 0 to 1, y 12 to 0, scale 0.995 to 1, duration 0.55, delay 0.22, `ease: 'power3.out'`.
5. Composer: opacity 0 to 1, y 8 to 0, duration 0.4, delay 0.34.
6. Footer: opacity 0 to 1, duration 0.4, delay 0.42.
7. Suggested chip row: `gsap.from` with `y: 6, opacity: 0, stagger: 0.04, delay: 0.5`.

Never animate height. Never animate width. Only opacity, y, and scale. Keep GPU transforms only.

### 9.2 Cache pill tick

The mono pill `cache 12s` ticks every second. On each tick, the seconds digit flips with a micro GSAP: `scale 1 -> 0.9 -> 1`, duration 0.25 total, with an opacity 1 -> 0.6 -> 1. The dot pulses sage every 2 seconds: `scale 1 -> 1.35 -> 1` over 0.6 seconds with `ease: 'sine.inOut'`, infinite, `yoyo: false`.

### 9.3 Suggested chip hover

Use a GSAP timeline on hover in:

- Border color: `#e6e6e1` to `#6b8f71`, duration 0.18.
- Text color: `#14181a` to `#6b8f71`, duration 0.18.
- y: 0 to -1, duration 0.18.

On hover out, reverse the timeline.

### 9.4 Submit animation

On user submit:

1. Input content does not clear until the mutation resolves locally. Instead, the button scales to 0.94 for 80ms then back, and the input border briefly flashes sage for 180ms.
2. Immediately after, a new user turn slides in. y 12 to 0, opacity 0 to 1, duration 0.28.
3. A placeholder agent turn fades in with a `KAIZEN` label and three pulsing sage dots where prose will go. Dots are 6px circles, 4px apart, each pulse `scale 1 -> 1.25 -> 1` over 0.7 seconds, staggered 0.12 seconds. The placeholder cross fades out the instant the first token arrives.

### 9.5 Streaming prose

Characters arrive from the server as SSE tokens. For each token, append text and run a single tween on the last text node: `opacity: 0 -> 1, duration: 0.15`. Do not animate per character; animate per token chunk.

### 9.6 Tool chip lifecycle

- On tool call start: a new row in the reasoning trace mounts with `opacity 0 to 1, y 4 to 0, duration 0.25`.
- Running dots: three circles, staggered pulse `scale 1 -> 1.3 -> 1`, duration 0.6, stagger 0.08, repeat infinite.
- On tool call end: dots fade out `opacity 1 -> 0, duration 0.15`, then the `ok 412ms` mono label fades in `opacity 0 to 1, duration 0.2`. A tiny sage check is optional, 10px, but only if it does not add visual weight. Skip if in doubt.

### 9.7 Reasoning trace collapse

Clicking `Show reasoning trace` runs a GSAP timeline:

- Chevron rotates 0 to 90 over 0.22.
- Container height auto expand is NOT allowed (see "never animate height"). Instead, render the trace already mounted but with `opacity 0`, `pointer-events: none`, `translateY(-4px)`, and `max-height: 0` computed from `scrollHeight` as a CSS transition fallback. For the animation, use `gsap.to` on `opacity: 1, y: 0` and toggle `max-height` outside GSAP with a CSS `transition: max-height 0.28s ease-out`. This is the one acceptable height animation because it is CSS not GSAP.

### 9.8 Error shake

If the `/api/chat` route returns an error, the composer input border flashes `rust`, and the whole composer shakes on x axis: `0 -> -4 -> 4 -> -2 -> 2 -> 0` over 0.4 seconds.

## 10. Accessibility

- Color contrast: all ink text against paper or sage-soft must pass AA. Verified: ink on paper is 17:1, ink on sage-soft is approximately 14:1.
- Keyboard: Tab moves through header links, suggested chips (when empty state), composer input, send button, footer links.
- Send button must be reachable via Enter on the input.
- `aria-live="polite"` on the chat panel for streaming updates.
- Every tool chip is a `<button>` that toggles its args expand state. Chip state changes announce via `aria-expanded`.
- Reduced motion: if `prefers-reduced-motion: reduce`, kill all GSAP tweens and fall back to instant state changes. Pulsing dots become a single static `...`.
- Focus ring is 3px `sage-soft` outline plus 1px `sage` border on all focusable elements. Never rely on default browser focus.

## 11. Responsive

- Desktop breakpoint: 768px and up. Uses the 720px max width column.
- Tablet: 640 to 767. Column grows to 92vw.
- Mobile: below 640. Page padding drops to 20px, chat panel padding drops to 20px horizontal 24px vertical, suggested chips wrap one or two per row, header "Dark Noise" label hides below 400px.
- Composer on mobile: input height stays 44px, button becomes 44 square, keep `Ask` label inside.
- Never introduce a hamburger menu. There is no nav.

## 12. Deliverables to return

1. A Figma frame (or single HTML file) of the home page at 1280 wide in empty state.
2. A second frame of the same page with one user turn plus a streaming agent turn that has a reasoning trace expanded and two tool chips inside.
3. A third frame of the mobile layout at 390 wide in the same streaming state.
4. One frame of `/blog/your-agent-is-a-customer-now` showing the first screenful.
5. The Tailwind theme extension snippet from section 4.
6. A GSAP starter file `lib/motion.ts` that exports:
   - `pageEnterTimeline(scope)`
   - `suggestedChipHoverTween(el)`
   - `streamTokenTween(el)`
   - `toolChipMountTween(el)`
   - `toolChipFinishTween(el)`
   - `errorShakeTween(el)`
   Each function returns a GSAP timeline or tween so the app can compose them.
7. Up to 8 pixel level notes as a bullet list in the form `app/page.tsx -> change X from A to B`.

## 13. Tech constraints

- Implementation stack: Next.js 15 App Router, React 19, Tailwind CSS 3, TypeScript, AI SDK v4 with Gemini 2.5 Flash backing the chat route, GSAP 3 with `@gsap/react`.
- No UI libraries. No shadcn. No Radix. No Framer Motion (GSAP only).
- No emoji anywhere in the UI.
- No em dashes in body copy. Use plain commas or restructure.
- No illustrations, no photographs, no product mockups embedded in the page.
- No dark mode in this pass.
- Ship-ready CSS must be Tailwind utility classes referencing the palette tokens. No inline hex in JSX.

## 14. Out of scope

- Auth, signup, billing, usage metering
- Multi project selector (Dark Noise is the only project)
- Persistent chat history across reloads
- Analytics overlay or admin tools
- A settings page
- A sidebar of past conversations

## 15. Copy deck (verbatim, paste into designs)

- Header right cluster initial state: `cache 12s`
- Hero title: `An AI analyst for the RevenueCat Charts API.`
- Sub hero: `Ask about Dark Noise's unit economics. Incomplete periods are flagged in every answer.`
- Empty state eyebrow: `TRY ONE`
- Suggested questions:
  1. `How is Dark Noise doing right now`
  2. `Show MRR for the last 30 days`
  3. `Break down MRR by store this quarter`
  4. `What is the trial conversion rate`
- Composer placeholder: `Ask about Dark Noise's revenue, trials, churn`
- Send button label: `Ask`
- Reasoning trace toggle: `Show reasoning trace`
- Footer left: `Built by Kaizen, an AI agent. Operated by Aayush Shrestha.`
- Footer right links: `github`, `blog`, `demo`, `scorecard`

## 16. Success criteria

The design pass succeeds if all of these are true:

- A first time viewer understands in 3 seconds that this is a chat, not a dashboard.
- The agent answer is the most prominent thing on the screen, above tool chips.
- No raw markdown asterisks are ever visible to the user.
- The palette reads as grey, light green, white only. No other color except the single rust error token.
- The page loads, the hero settles, and the chat panel takes focus within 700ms of first paint.
- A reviewer can read a full agent answer without scrolling on a 1280 by 800 viewport.
- Reduced motion users see a completely static, legible layout with no loss of content.

Return deliverables in section 12. Ship it.
