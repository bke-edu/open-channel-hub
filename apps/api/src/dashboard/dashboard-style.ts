/** Same-origin Paper & Ink stylesheet; pages contain no inline style or script. */
export const dashboardStyle = `
:root {
  color-scheme: light;
  --paper: oklch(94.8% 0.022 82);
  --paper-raised: oklch(97.4% 0.015 84);
  --paper-deep: oklch(90.7% 0.03 79);
  --ink: oklch(25% 0.028 54);
  --ink-soft: oklch(40.5% 0.027 55);
  --ink-faint: oklch(50.5% 0.024 60);
  --line: oklch(81.5% 0.035 75);
  --line-strong: oklch(62.5% 0.042 70);
  --accent: oklch(46.5% 0.16 29);
  --accent-hover: oklch(38% 0.15 29);
  --accent-soft: oklch(87.5% 0.06 42);
  --accent-contrast: oklch(97% 0.015 84);
  --selection: oklch(82% 0.09 47);
  --texture-dot: oklch(42% 0.03 68 / 0.22);
  --success: oklch(42% 0.12 145);
  --warning: oklch(53% 0.13 78);
  --danger: oklch(46% 0.15 28);
  --shadow: 0 1px 0 oklch(32% 0.03 55 / 0.12), 0 14px 40px oklch(32% 0.03 55 / 0.08);
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: clamp(2rem, 1.4rem + 2vw, 3.5rem);
  --radius-small: 0.125rem;
  --radius-panel: 0.25rem;
  --duration-fast: 160ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --paper: oklch(31.5% 0.018 55);
    --paper-raised: oklch(36.5% 0.02 56);
    --paper-deep: oklch(28.5% 0.017 54);
    --ink: oklch(90% 0.025 78);
    --ink-soft: oklch(75.5% 0.027 72);
    --ink-faint: oklch(69% 0.026 68);
    --line: oklch(42.5% 0.025 58);
    --line-strong: oklch(58% 0.032 62);
    --accent: oklch(72% 0.13 32);
    --accent-hover: oklch(79% 0.11 38);
    --accent-soft: oklch(39% 0.052 35);
    --accent-contrast: oklch(24% 0.025 52);
    --selection: oklch(49% 0.085 35);
    --texture-dot: oklch(90% 0.02 78 / 0.13);
    --success: oklch(72% 0.12 145);
    --warning: oklch(78% 0.13 78);
    --danger: oklch(72% 0.13 28);
    --shadow: 0 1px 0 oklch(12% 0.015 50 / 0.45), 0 18px 44px oklch(12% 0.015 50 / 0.24);
  }
}

* { box-sizing: border-box; }
html { background: var(--paper); scroll-behavior: smooth; }
body {
  background: radial-gradient(circle, var(--texture-dot) 0 0.45px, transparent 0.6px), var(--paper);
  background-size: 7px 9px, auto;
  color: var(--ink);
  font-family: var(--font-body);
  font-size: clamp(0.98rem, 0.95rem + 0.13vw, 1.06rem);
  line-height: 1.62;
  margin: 0;
  min-width: 20rem;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
body::before { background: var(--paper); content: ""; inset: 0; opacity: 0.08; pointer-events: none; position: fixed; z-index: 9999; }
button, input, select, textarea { color: inherit; font: inherit; }
button, .google-sign-in, .quiet-link, .scope-link, .next-page, .dashboard-nav-item, .connection-action { -webkit-tap-highlight-color: transparent; }
button { align-items: center; background: var(--paper-raised); border: 1px solid var(--line-strong); border-radius: var(--radius-small); box-shadow: 2px 2px 0 var(--line); cursor: pointer; display: inline-flex; font-weight: 650; justify-content: center; min-height: 2.75rem; padding: 0.62rem 0.9rem; transition: background-color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out); }
button:hover { border-color: var(--accent); box-shadow: 3px 3px 0 var(--accent-soft); color: var(--accent-hover); transform: translate(-1px, -1px); }
button:active { box-shadow: 1px 1px 0 var(--line); transform: translate(1px, 1px); }
button:focus-visible, .google-sign-in:focus-visible, .quiet-link:focus-visible, .scope-link:focus-visible, .next-page:focus-visible, .dashboard-nav-item:focus-visible, .connection-action:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
a { color: inherit; }
code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; }
.skip-link { background: var(--accent); color: var(--accent-contrast); left: var(--space-3); padding: 0.55rem 0.8rem; position: fixed; text-decoration: none; top: -5rem; z-index: 10000; }
.skip-link:focus { top: var(--space-3); }

.dashboard-shell, .login-shell { margin: 0 auto; max-width: 78rem; padding: var(--space-4); }
.login-shell { align-items: center; display: flex; min-height: 100dvh; max-width: 36rem; }
.login-panel, .ledger, .scope-bar, .capability-panel { background: color-mix(in srgb, var(--paper-raised) 92%, transparent); border: 1px solid var(--line); box-shadow: var(--shadow); }
.login-panel { border-top: 4px double var(--line-strong); padding: var(--space-5); position: relative; width: 100%; }
.login-panel::before, .dashboard-header::before { background: var(--accent); content: ""; display: block; height: 0.22rem; left: 0; position: absolute; top: 0; width: 3.5rem; }
.eyebrow { color: var(--accent); font-family: var(--font-body); font-size: 0.7rem; font-weight: 650; letter-spacing: 0.2em; line-height: 1.3; margin: 0 0 var(--space-2); text-transform: uppercase; }
h1, h2, h3 { font-family: var(--font-display); font-weight: 650; letter-spacing: -0.04em; margin: 0; text-wrap: balance; }
h1 { font-size: clamp(2.7rem, 1.8rem + 4.8vw, 5.4rem); line-height: 0.92; }
h2 { font-size: clamp(1.8rem, 1.45rem + 1.8vw, 2.65rem); line-height: 1.05; }
h3 { font-size: 1.18rem; line-height: 1.15; }
.lede, .scope-bar p, .header-subtitle { color: var(--ink-soft); line-height: 1.58; }
.login-form { display: grid; gap: var(--space-4); margin-top: var(--space-5); }
label { display: grid; gap: var(--space-2); font-weight: 650; }
input, select, textarea { background: var(--paper); border: 1px solid var(--line-strong); border-radius: var(--radius-small); min-height: 2.75rem; padding: 0.58rem 0.7rem; }
textarea { min-height: 7.5rem; resize: vertical; }
.notice { background: var(--accent-soft); border: 1px solid var(--accent); color: var(--accent-hover); margin: var(--space-4) 0 0; padding: var(--space-3); }
.login-separator { color: var(--ink-faint); margin: var(--space-4) 0; text-align: center; }
.google-sign-in { align-items: center; border: 1px solid var(--line-strong); display: flex; font-weight: 650; justify-content: center; min-height: 2.75rem; padding: 0.62rem 0.9rem; text-decoration: none; }
.google-sign-in:hover { border-color: var(--accent); color: var(--accent-hover); }

.dashboard-header { align-items: flex-start; border-bottom: 4px double var(--line-strong); display: flex; flex-direction: column; gap: var(--space-4); padding: var(--space-5) 0 var(--space-5); position: relative; }
.dashboard-header > div { min-width: 0; padding-top: var(--space-3); }
.dashboard-header .header-subtitle { font-size: 0.92rem; margin: var(--space-3) 0 0; max-width: 42rem; }
.header-actions { align-items: center; display: flex; flex-wrap: wrap; gap: var(--space-2); }
.quiet-button, .quiet-link { background: transparent; color: var(--ink); }
.quiet-link { border: 1px solid var(--line-strong); display: inline-flex; font-weight: 650; min-height: 2.75rem; padding: 0.62rem 0.9rem; text-align: center; text-decoration: none; }
.quiet-link:hover { border-color: var(--accent); color: var(--accent-hover); }
.dashboard-nav { border-bottom: 1px solid var(--line); display: grid; gap: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: var(--space-4) 0; }
.dashboard-nav-item { border: 1px solid transparent; border-bottom-color: var(--line); display: grid; gap: 0.16rem; min-height: 3.7rem; padding: 0.72rem 0.78rem; text-decoration: none; }
.dashboard-nav-item strong { font-size: 0.86rem; }
.dashboard-nav-item small { color: var(--ink-faint); font-size: 0.7rem; line-height: 1.25; }
.dashboard-nav-item:hover { background: var(--accent-soft); border-color: var(--line); color: var(--accent-hover); }
.dashboard-nav-active { border-bottom: 3px solid var(--accent); color: var(--accent); }
.dashboard-nav-active small { color: var(--ink-soft); }
.scope-bar { display: grid; gap: var(--space-4); margin: var(--space-4) 0; padding: var(--space-4); }
.scope-bar form { align-items: end; display: grid; gap: var(--space-2); grid-template-columns: 1fr; }
.scope-bar p { font-size: 0.82rem; margin: 0; overflow-wrap: anywhere; }
.scope-links { align-items: center; display: flex; flex-wrap: wrap; gap: var(--space-2); }
.scope-label { color: var(--ink-faint); font-size: 0.78rem; font-weight: 650; margin-right: var(--space-1); }
.scope-link { border-bottom: 1px solid var(--line-strong); color: var(--ink-soft); font-size: 0.82rem; font-weight: 650; min-height: 2.5rem; padding: 0.55rem 0.72rem; text-decoration: none; }
.scope-link[aria-current="page"] { background: var(--accent); color: var(--accent-contrast); }
.scope-link:hover { color: var(--accent-hover); }
.page-intro { border-left: 3px solid var(--accent); margin: var(--space-5) 0; padding: var(--space-2) var(--space-4); }
.page-intro h2 { margin-bottom: var(--space-2); }
.page-intro p:not(.eyebrow) { color: var(--ink-soft); line-height: 1.6; margin: 0; max-width: 58rem; }

.summary-grid { display: grid; gap: var(--space-2); grid-template-columns: repeat(2, minmax(0, 1fr)); margin: var(--space-4) 0; }
.summary-card { background: var(--paper-deep); border: 1px solid var(--line); border-top: 3px solid var(--accent); display: grid; gap: 0.2rem; min-height: 6.3rem; padding: var(--space-3); }
.summary-card strong { font-family: var(--font-display); font-size: clamp(1.25rem, 0.96rem + 1.5vw, 2rem); letter-spacing: -0.04em; }
.summary-card span:last-child { color: var(--ink-soft); font-size: 0.75rem; line-height: 1.3; }
.summary-index { color: var(--accent); font-size: 0.68rem; font-weight: 750; letter-spacing: 0.08em; }
.summary-card-muted { border-top-color: var(--line-strong); }
.summary-card-muted strong { color: var(--ink-faint); }

.workflow-rail { border-bottom: 3px double var(--line-strong); border-top: 1px solid var(--line-strong); margin: var(--space-5) 0; padding: var(--space-3) 0; }
.workflow-rail > .eyebrow { margin-left: var(--space-1); }
.workflow-rail ol { display: grid; gap: var(--space-2); list-style: none; margin: 0; padding: 0; }
.workflow-step { align-items: baseline; border-left: 2px solid var(--line); display: grid; gap: var(--space-1) var(--space-2); grid-template-columns: 2.2rem minmax(0, 1fr); padding: var(--space-2) var(--space-3); }
.workflow-step > span { color: var(--ink-faint); font-size: 0.72rem; font-weight: 750; }
.workflow-step > strong { font-family: var(--font-display); font-size: 1rem; }
.workflow-step > small { color: var(--ink-soft); font-size: 0.78rem; grid-column: 2; line-height: 1.4; }
.workflow-active { background: var(--accent-soft); border-left-color: var(--accent); }
.workflow-active > span, .workflow-active > strong { color: var(--accent); }
.workflow-paused { border-left-color: var(--warning); }

.connection-scope { align-items: start; border-bottom: 1px solid var(--line); border-top: 1px solid var(--line); display: grid; gap: var(--space-3); margin: var(--space-4) 0; padding: var(--space-3) 0; }
.connection-scope p { color: var(--ink-soft); font-size: 0.88rem; line-height: 1.45; margin: 0; }
.connection-scope ul { display: flex; flex-wrap: wrap; gap: var(--space-2); list-style: none; margin: 0; padding: 0; }
.connection-scope li { align-items: center; border: 1px solid var(--line); display: inline-flex; gap: 0.45rem; padding: 0.42rem 0.6rem; }
.connection-scope code { font-size: 0.74rem; overflow-wrap: anywhere; }
.connection-scope li small { color: var(--ink-faint); font-size: 0.7rem; }

.ledger { overflow: hidden; padding: var(--space-4); }
.ledger-heading { border-bottom: 1px solid var(--line); padding-bottom: var(--space-4); }
.ledger-note { color: var(--ink-soft); font-size: 0.9rem; line-height: 1.5; margin: var(--space-2) 0 0; }
.event-list, .command-list { display: grid; gap: var(--space-3); list-style: none; margin: var(--space-4) 0; padding: 0; }
.event-card, .command-card { background: var(--paper-raised); border: 1px solid var(--line); border-left: 3px solid var(--line-strong); padding: var(--space-4); }
.command-card { border-left-color: var(--accent); }
.event-meta { color: var(--ink-faint); display: flex; flex-wrap: wrap; font-size: 0.7rem; font-weight: 700; gap: var(--space-2) var(--space-4); letter-spacing: 0.05em; text-transform: uppercase; }
.event-message { font-family: var(--font-display); font-size: 1.1rem; line-height: 1.55; margin: var(--space-3) 0; overflow-wrap: anywhere; white-space: pre-wrap; }
dl { color: var(--ink-soft); display: grid; gap: var(--space-2); margin: 0; }
dl div { align-items: start; display: grid; gap: var(--space-2); grid-template-columns: 6.3rem minmax(0, 1fr); }
dt { color: var(--ink-faint); font-size: 0.72rem; font-weight: 750; }
dd { margin: 0; overflow-wrap: anywhere; }
.reply-intent-form { border-top: 1px solid var(--line); display: grid; gap: var(--space-4); margin-top: var(--space-4); padding-top: var(--space-4); }
.command-evidence { border-top: 1px dashed var(--line); margin-top: var(--space-4); padding-top: var(--space-3); }
.evidence-title { color: var(--ink-faint); font-size: 0.72rem; font-weight: 750; letter-spacing: 0.08em; margin: 0 0 var(--space-2); text-transform: uppercase; }
.evidence-list { display: flex; flex-wrap: wrap; gap: var(--space-2); list-style: none; margin: 0; padding: 0; }
.evidence-chip { border: 1px solid var(--line); font-size: 0.78rem; font-weight: 650; line-height: 1.25; padding: 0.42rem 0.6rem; }
.evidence-positive { background: color-mix(in srgb, var(--success) 12%, var(--paper-raised)); border-color: color-mix(in srgb, var(--success) 45%, var(--line)); color: var(--success); }
.evidence-warning { background: color-mix(in srgb, var(--warning) 12%, var(--paper-raised)); border-color: color-mix(in srgb, var(--warning) 45%, var(--line)); color: var(--warning); }
.evidence-danger { background: color-mix(in srgb, var(--danger) 12%, var(--paper-raised)); border-color: color-mix(in srgb, var(--danger) 45%, var(--line)); color: var(--danger); }
.evidence-muted { background: var(--paper-deep); color: var(--ink-faint); }
.empty-state { color: var(--ink-faint); padding: var(--space-5) 0 var(--space-2); }
.next-page { color: var(--accent); display: inline-flex; font-weight: 700; min-height: 2.75rem; padding: 0.7rem 0; text-decoration: none; }
.next-page:hover { color: var(--accent-hover); text-decoration: underline; }

.connection-grid { display: grid; gap: var(--space-3); margin: var(--space-4) 0; }
.connection-card { background: var(--paper-raised); border: 1px solid var(--line); border-left: 3px solid var(--accent); padding: var(--space-4); }
.connection-card-top { align-items: center; display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: space-between; }
.channel-kicker { color: var(--accent); font-size: 0.72rem; font-weight: 750; letter-spacing: 0.06em; text-transform: uppercase; }
.connection-status { color: var(--ink-faint); font-size: 0.66rem; letter-spacing: 0.05em; }
.connection-status i { background: var(--success); border-radius: 50%; display: inline-block; height: 0.45rem; margin-right: 0.24rem; width: 0.45rem; }
.connection-card h3 { margin: var(--space-3) 0 var(--space-2); overflow-wrap: anywhere; }
.connection-card h3 code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 1rem; }
.connection-meta { color: var(--ink-faint); font-size: 0.72rem; margin: 0 0 var(--space-3); }
.connection-routes { border-top: 1px dashed var(--line); margin-top: var(--space-3); padding-top: var(--space-3); }
.connection-routes code, .capability-route { font-size: 0.7rem; overflow-wrap: anywhere; }
.connection-note { color: var(--ink-soft); font-size: 0.78rem; line-height: 1.45; margin: var(--space-3) 0 0; }
.connection-action { align-items: center; background: var(--accent); color: var(--accent-contrast); display: inline-flex; font-weight: 700; gap: var(--space-2); justify-content: space-between; margin-top: var(--space-4); min-height: 2.75rem; padding: 0.7rem 0.85rem; text-decoration: none; }
.connection-action:hover { background: var(--accent-hover); }
.guide-grid { display: grid; gap: var(--space-3); margin: var(--space-4) 0; }
.guide-card { background: var(--paper-raised); border: 1px solid var(--line); border-top: 3px solid var(--accent); min-height: 12rem; padding: var(--space-4); }
.guide-card > span:first-child { color: var(--accent); font-size: 0.72rem; font-weight: 750; }
.guide-card h3 { margin: var(--space-2) 0; }
.guide-card p { color: var(--ink-soft); font-size: 0.86rem; line-height: 1.5; margin: 0 0 var(--space-4); }
.guide-card a { color: var(--accent); font-weight: 700; }
.guide-card-paused { border-top-color: var(--warning); }
.guide-card-paused > span:first-child, .guide-card-paused h3 { color: var(--warning); }
.paused-label { color: var(--warning); font-size: 0.68rem; letter-spacing: 0.07em; }
.capability-panel { margin: var(--space-5) 0; padding: var(--space-4); }
.capability-list-large { display: grid; gap: var(--space-2); list-style: none; margin: var(--space-4) 0 0; padding: 0; }
.capability-row { border-left: 2px solid var(--line-strong); display: grid; gap: var(--space-2); padding: var(--space-3); }
.capability-row > div { align-items: baseline; display: flex; flex-wrap: wrap; gap: var(--space-3); justify-content: space-between; }
.capability-row code { color: var(--ink-faint); font-size: 0.72rem; overflow-wrap: anywhere; }
.capability-row p { color: var(--ink-soft); line-height: 1.5; margin: 0; }
.capability-route { color: var(--accent); }

@media (min-width: 42rem) {
  .dashboard-shell { padding: var(--space-6); }
  .dashboard-header { align-items: center; flex-direction: row; justify-content: space-between; }
  .scope-bar { align-items: center; grid-template-columns: minmax(0, 1fr) auto; }
  .scope-bar form { grid-template-columns: auto minmax(12rem, 20rem) auto; }
  .workflow-rail ol { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .workflow-step { grid-template-columns: 1fr; }
  .workflow-step > small { grid-column: auto; }
  .connection-scope { grid-template-columns: minmax(0, 1fr) minmax(16rem, 1fr); }
  .dashboard-nav { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .summary-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .connection-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .guide-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
}
`;
