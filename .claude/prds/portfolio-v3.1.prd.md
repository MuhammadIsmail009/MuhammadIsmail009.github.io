# PRD — Portfolio v3.1: Originality Rebuild

**Status:** Approved by Ismail 2026-07-12 · not yet implemented
**Inputs:** 3-agent code review of `df856ff..HEAD` + ultracode audit/ideation/judging workflow (full JSON: `.claude/prds/v3.1-audit-concepts.json`)

## Problem

The v3 feature set (4 unpushed commits) adapted Abubakar's portfolio too literally — the audit found 7 **blatant** copies (fingerprint Dossier, pipeline canvas, SOC/OS mode, `kryptctl` brand, git-log Experience, "secure channel" footer decrypt, ⌘K command inventory) plus noticeable echoes (Work HUD, hero corner cluster, `// IDENTITY` card, cursor label vocab, scramble links). Ismail: keep the *feel* he admired (scroll-animated projects, committed color world) but make it unmistakably his — "sexy but professional, nothing unnecessary." Direction: **stop decorating like a hacker, start demonstrating like an analyst.**

## Decisions (locked by Ismail)

| Area | Decision |
|---|---|
| Work | **Triage Queue + Sigma rules** — projects as dim mono alert-queue rows that FLIP-expand into case cards on scroll; each carries runnable Sigma YAML; queue burns down |
| Approach | **One Alert, Four Moves** — pinned evidence pane walks one real alert (encoded PowerShell from Word doc) through Model→Detect→Triage→Harden |
| SOC mode + DefenseGame | **Cut entirely** |
| Footer | **End of Shift** — receipt-printer shift-handover log + ACKNOWLEDGE HANDOVER button (copies email) |
| Palette | Ember stays (locked); fold in cohesion polish — teal = "resolved/benign" meaning only |
| Backlog (not this round) | KEV-wire ticker (CISA feed via GitHub Action), ATT&CK coverage heatmap |

## Build phases

### P1 — Demolition & de-branding
- Delete: `src/components/soc/*` (SocMode, BootLog, WindowFrame, DefenseGame), `Dossier.tsx`, `ApproachPipeline.tsx` + all their entry points (nav pill, palette commands, terminal commands, App wiring).
- Rename `kryptctl` (Terminal.tsx, content.ts — "krypt" is Abubakar's brand) → new shell name in Ismail's voice.
- CommandPalette: keep the palette (generic craft) but rewrite the command inventory so it doesn't mirror his item-for-item; drop `sudo hire-ismail`+☺, the "what your browser leaks" entry, OS-boot entry.
- Experience: drop the git-log skin (commit/Author/Date lines, fake hashes) → clean original presentation of the same truth content.
- Hero: break up his corner-cluster composition (drop coords-as-design + rotating ticker; keep clock, restyle cue).
- About: rework `// IDENTITY` card label/rows; Cursor: drop OPEN/VIEW/MAIL label pill vocabulary; remove data-scramble hover treatment; thin the effect stack to 2–3 signature motions.

### P2 — Triage Queue (Work)
Vertical section replacing the pinned horizontal track. Six compact rows (id, title, meta, severity dot) → per-row one-time ScrollTrigger Flip.from() into full case card (desc, tags, EVIDENCE links, VIEW SIGMA RULE toggle → syntax-tinted valid YAML authored per project in content.ts). Reduced motion: all expanded. Mobile-native vertical.

### P3 — One Alert, Four Moves (Approach)
Sticky split: step cards left, pinned evidence pane right holding one pre-authored syntax-highlighted JSON event. Four scroll states: field highlights → Sigma condition + ATT&CK T1059.001 chip → EPSS/KEV enrichment + severity verdict → tuned-rule two-line diff. Mobile: tap-through tabs. Pure DOM/CSS spans, no canvas.

### P4 — End of Shift (Footer)
Log lines slide up from a hairline "printer slot" (GSAP y+clip stagger — deliberately NOT scramble/typing). ACKNOWLEDGE HANDOVER button: copies email, prints "handover acknowledged · <local time>", STATUS → HANDED OFF. Plain accessible links below. Reduced motion: instant render.

### P5 — Surviving review fixes
From the earlier 3-agent review (rest went moot with the rebuild): CommandPalette focus trap + scroll lock + toast timeout; Hero nested ticker timeout + bottom-row 640–760px collision; Terminal dispatch timeout; Cursor mousemove early-exit; content.ts NCERT date → 'Jun 2026 — present' + org dedupe.

## Ship checklist
1. `npm run build` green · 2. `npm run verify` (Playwright, 0 console errors) · 3. Browser pass (Chrome foregrounded — backgrounded rAF freezes preloader) · 4. Ismail visual review → push (Pages auto-deploys) · 5. Live Lighthouse: Perf ≥ 90, A11y 100.
