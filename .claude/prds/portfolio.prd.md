# Muhammad Ismail — Animated Cybersecurity Portfolio

## Problem
Muhammad Ismail is a final-year cybersecurity engineer (GIK, graduating 2027) actively pursuing internships and roles in SOC / detection engineering. His current presence is a bare GitHub profile, which does not convey the depth of his blue-team work, research, or full-stack range, and does not differentiate him in a crowded recruiter inbox. He needs a single, memorable, recruiter-facing surface that proves both technical seriousness and craft.

## Evidence
- Final-year student in an active internship/job search (brief states "Available for internships"; PITB SOC alum; FYP in progress) — Assumption, grounded in the brief; not validated via analytics.
- Reference bar is explicit: Awwwards Site-of-the-Day calibre developer portfolios that funnel from a rich GitHub profile README to a real 3D site (e.g. the kryptbakar workflow).

## Users
- **Primary**: Technical recruiters and hiring managers for security/SOC roles who land via LinkedIn or the GitHub profile, skim on desktop and mobile, and decide in under a minute whether to read on.
- **Secondary**: Peers / the security community who may share the site; the candidate himself, using it as a living résumé.
- **Not for**: General consumers; this is not a product or content site and carries no novelty/humor outside the terminal easter egg.

## Hypothesis
We believe **an original, performant, motion-rich single-page portfolio with a genuine 3D signature, paired with a polished GitHub profile README that links to it**, will **convert profile/LinkedIn visitors into engaged readers who take a contact action** for **security recruiters and hiring managers**.
We'll know we're right when **the site is live at the root user-site URL, passes the performance/a11y bar below, and presents all real content accurately with working contact paths**.

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Lighthouse Performance | ≥ 90 (mobile) | Lighthouse CI / DevTools on the built site |
| Lighthouse Best Practices | ≥ 95 | Lighthouse |
| Lighthouse SEO | ≥ 95 | Lighthouse |
| Lighthouse Accessibility | ≥ 95 | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse / WebPageTest |
| Reduced-motion path | Fully functional (no 3D/scramble/parallax; fades only) | Manual + emulated `prefers-reduced-motion` |
| Live deploy | `https://muhammadismail009.github.io/` resolves & renders | Manual verification post-Action |
| Profile README | Renders inline on the GitHub profile, links to live site | Manual verification |

## Scope
**MVP** — A single-page, deploy-ready portfolio covering: preloader; glass nav; hero (scramble headline + R3F security-graph + custom cursor); About; Selected Work (6 projects, incl. Secure IoT); Experience (incl. Ebryx incoming line); Stack toolbelt; skills marquee; impact counters; terminal easter egg; footer CTA + contact. Full `prefers-reduced-motion` fallback. GitHub Actions deploy to the user-site root. SEO/OG/favicon/robots/sitemap/JSON-LD. Plus a recruiter-facing animated GitHub profile README that drives to the live site.

**Locked decisions (from clarification)**
- Contact email: `ismailwaqar28@gmail.com`
- Project links → `https://github.com/MuhammadIsmail009` (profile) for now; exact repo URLs swapped in later.
- Heading typeface: **Clash Display** (body: Satoshi; mono: JetBrains Mono).
- Include the **Ebryx "Incoming Security Intern"** line and the **Secure IoT / Zero-Trust** 6th project.

**Out of scope**
- CMS / backend / contact form server — contact is mailto + social links; no server needed.
- Router / multi-page — single-page scroll only (no Pages routing risk).
- localStorage/sessionStorage — state stays in React (per brief).
- Higgsfield-generated assets as a hard dependency — CSS/SVG fallbacks are the default; generation is optional polish only.
- Blog / case-study deep pages beyond the in-page expanding panel.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Foundation & design system | Repo scaffolded; tokens, self-hosted fonts, smooth-scroll wired; blank app boots | complete | — |
| 2 | Static content shell | All sections render with real, accurate content and look intentional with zero motion | complete | — |
| 3 | Motion & 3D layer | Preloader, hero scramble + security graph, scroll choreography, work gallery, marquee, counters, terminal, footer CTA | complete | — |
| 4 | Polish pass | Spacing/rhythm, hover & focus states, empty/edge states, mobile refinement | complete | — |
| 5 | A11y, reduced-motion & performance | Reduced-motion path complete; Lighthouse targets met; 3D lazy/throttled | complete | — |
| 6 | Ship gates | react-review, security-review, quality-gate, build-fix, verify all green | complete | — |
| 7 | Deploy & SEO | Live at user-site root via Actions; OG/favicon/sitemap/robots/JSON-LD present | complete | — |
| 8 | GitHub profile README | Animated, recruiter-friendly README in MuhammadIsmail009 repo funnels to live site | complete | — |

## Open Questions
- [ ] Exact public repo URLs for the 5–6 projects (interim: profile link). Owner: Ismail.
- [ ] Whether a dedicated public contact email is preferred over the account email (interim: account email). Owner: Ismail.
- [ ] OG image: hand-built SVG→PNG vs. optional Higgsfield-generated texture (interim: hand-built).

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 3D scene hurts mobile LCP / FPS | Med | High | Lazy-mount, cap DPR, pause offscreen/hidden, reduced-motion disables it, CSS fallback bloom |
| Heavy motion fails a11y / reduced-motion | Med | High | `gsap.matchMedia` reduced-motion branch from the start; fades-only fallback is a definition-of-done gate |
| Self-hosted Fontshare fonts unavailable offline | Med | Med | Probe/download at scaffold; fall back to Inter/system stack with documented swap if fetch fails |
| GitHub Pages user-site base/path misconfig | Low | High | `base:'/'`, Actions Pages artifact deploy, verify live URL before closing milestone 7 |
| Library version incompatibility (R3F/React/drei) | Med | Med | Pin R3F v8 + drei v9 for React 18; run build-fix gate |
| Scope creep across 8 milestones | Med | Med | Checkpoint (commit) per milestone; static-first before motion |

---
*Status: SHIPPED. All 8 milestones complete (2026-06-15). Live at https://muhammadismail009.github.io/ via GitHub Actions; profile README live at https://github.com/MuhammadIsmail009. Live mobile Lighthouse median: Performance 92 / Accessibility 100 / Best Practices 100 / SEO 100 (LCP ~2.2s, CLS 0.095, TBT ~200ms). Ship gates green; security-review fixed a terminal prototype-chain crash (regression-tested).*
