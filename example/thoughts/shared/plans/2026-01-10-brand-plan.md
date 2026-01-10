# Brand Plan Implementation Plan

**Goal:** Apply the nof1 brand updates to `before.html` (light theme, system fonts, simplified components, and revised copy).

**Architecture:** Single static HTML file with embedded CSS. Add a lightweight Node assert test (`tests/brand-plan.test.js`) that reads `before.html` and verifies CSS tokens and copy strings after each change.

**Design:** `docs/brand-plan.md`

**Prerequisites:**
- Ensure `node` is available to run `node tests/brand-plan.test.js`.
- Create `tests/` directory at repo root if it does not exist.

---

## Task 1: Core CSS variables

**Files:**
- Create: `tests/brand-plan.test.js`
- Modify: `before.html:8-27`

**Step 1: Write the failing test**

```javascript
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "before.html"), "utf8");

assert.ok(html.includes("--primary: #2563eb;"));
assert.ok(html.includes("--accent: #7c3aed;"));
assert.ok(html.includes("--background: #ffffff;"));
assert.ok(html.includes("--surface: #ffffff;"));
assert.ok(html.includes("--surface-elevated: #f9fafb;"));
assert.ok(html.includes("--text: #111111;"));
assert.ok(html.includes("--text-muted: #6b7280;"));
assert.ok(html.includes("--border: #e5e7eb;"));
assert.ok(html.includes("--border-subtle: #f1f5f9;"));
assert.ok(html.includes("--success: #16a34a;"));
assert.ok(html.includes("--warning: #f59e0b;"));
assert.ok(html.includes("--error: #dc2626;"));
assert.ok(html.includes("--series-blue: #2563eb;"));
assert.ok(html.includes("--series-purple: #7c3aed;"));
assert.ok(html.includes("--series-orange: #f59e0b;"));
assert.ok(html.includes("--series-teal: #14b8a6;"));
assert.ok(html.includes("--series-slate: #64748b;"));
assert.ok(html.includes("--series-black: #111111;"));
assert.ok(!html.includes("--primary-dark: #4f46e5;"));
assert.ok(!html.includes("--secondary: #ec4899;"));

console.log("brand plan variable checks passed");
```

**Step 2: Run test to verify it fails**

Run: `node tests/brand-plan.test.js`  
Expected: FAIL with missing `--primary: #2563eb;` in `before.html`

**Step 3: Write minimal implementation**

```html
    :root {
      --primary: #2563eb;
      --accent: #7c3aed;
      --background: #ffffff;
      --surface: #ffffff;
      --surface-elevated: #f9fafb;
      --text: #111111;
      --text-muted: #6b7280;
      --border: #e5e7eb;
      --border-subtle: #f1f5f9;
      --success: #16a34a;
      --warning: #f59e0b;
      --error: #dc2626;
      --series-blue: #2563eb;
      --series-purple: #7c3aed;
      --series-orange: #f59e0b;
      --series-teal: #14b8a6;
      --series-slate: #64748b;
      --series-black: #111111;
      --font-sans: 'Poppins', system-ui, sans-serif;
      --font-mono: 'Fira Code', monospace;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 20px;
      --radius-xl: 28px;
    }
```

**Step 4: Run test to verify it passes**

Run: `node tests/brand-plan.test.js`  
Expected: PASS with `brand plan variable checks passed`

**Step 5: Commit**

```bash
git add tests/brand-plan.test.js before.html
git commit -m "feat(brand): update core color tokens"
```

---

## Task 2: Typography tokens and font imports

**Files:**
- Modify: `tests/brand-plan.test.js`
- Modify: `before.html:8-31`

**Step 1: Write the failing test**

```javascript
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "before.html"), "utf8");

assert.ok(html.includes("--primary: #2563eb;"));
assert.ok(html.includes("--accent: #7c3aed;"));
assert.ok(html.includes("--background: #ffffff;"));
assert.ok(html.includes("--surface: #ffffff;"));
assert.ok(html.includes("--surface-elevated: #f9fafb;"));
assert.ok(html.includes("--text: #111111;"));
assert.ok(html.includes("--text-muted: #6b7280;"));
assert.ok(html.includes("--border: #e5e7eb;"));
assert.ok(html.includes("--border-subtle: #f1f5f9;"));
assert.ok(html.includes("--success: #16a34a;"));
assert.ok(html.includes("--warning: #f59e0b;"));
assert.ok(html.includes("--error: #dc2626;"));
assert.ok(html.includes("--series-blue: #2563eb;"));
assert.ok(html.includes("--series-purple: #7c3aed;"));
assert.ok(html.includes("--series-orange: #f59e0b;"));
assert.ok(html.includes("--series-teal: #14b8a6;"));
assert.ok(html.includes("--series-slate: #64748b;"));
assert.ok(html.includes("--series-black: #111111;"));
assert.ok(!html.includes("--primary-dark: #4f46e5;"));
assert.ok(!html.includes("--secondary: #ec4899;"));
assert.ok(!html.includes("fonts.googleapis.com"));

assert.ok(html.includes("--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;"));
assert.ok(html.includes("--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"));
assert.ok(html.includes("--font-display: Georgia, 'Times New Roman', serif;"));
assert.ok(html.includes("--text-xs: 0.75rem;"));
assert.ok(html.includes("--text-sm: 0.875rem;"));
assert.ok(html.includes("--text-base: 1rem;"));
assert.ok(html.includes("--text-lg: 1.125rem;"));
assert.ok(html.includes("--text-xl: 1.25rem;"));
assert.ok(html.includes("--text-2xl: 1.5rem;"));

console.log("brand plan variable checks passed");
```

**Step 2: Run test to verify it fails**

Run: `node tests/brand-plan.test.js`  
Expected: FAIL with `fonts.googleapis.com` still present

**Step 3: Write minimal implementation**

```html
    :root {
      --primary: #2563eb;
      --accent: #7c3aed;
      --background: #ffffff;
      --surface: #ffffff;
      --surface-elevated: #f9fafb;
      --text: #111111;
      --text-muted: #6b7280;
      --border: #e5e7eb;
      --border-subtle: #f1f5f9;
      --success: #16a34a;
      --warning: #f59e0b;
      --error: #dc2626;
      --series-blue: #2563eb;
      --series-purple: #7c3aed;
      --series-orange: #f59e0b;
      --series-teal: #14b8a6;
      --series-slate: #64748b;
      --series-black: #111111;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      --font-display: Georgia, 'Times New Roman', serif;
      --text-xs: 0.75rem;
      --text-sm: 0.875rem;
      --text-base: 1rem;
      --text-lg: 1.125rem;
      --text-xl: 1.25rem;
      --text-2xl: 1.5rem;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 20px;
      --radius-xl: 28px;
    }
```

Remove the `@import` line for Google Fonts entirely.

**Step 4: Run test to verify it passes**

Run: `node tests/brand-plan.test.js`  
Expected: PASS with `brand plan variable checks passed`

**Step 5: Commit**

```bash
git add tests/brand-plan.test.js before.html
git commit -m "feat(brand): refresh typography tokens"
```

---

## Task 3: Border radius scale

**Files:**
- Modify: `tests/brand-plan.test.js`
- Modify: `before.html:8-27`

**Step 1: Write the failing test**

```javascript
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "before.html"), "utf8");

assert.ok(html.includes("--primary: #2563eb;"));
assert.ok(html.includes("--accent: #7c3aed;"));
assert.ok(html.includes("--background: #ffffff;"));
assert.ok(html.includes("--surface: #ffffff;"));
assert.ok(html.includes("--surface-elevated: #f9fafb;"));
assert.ok(html.includes("--text: #111111;"));
assert.ok(html.includes("--text-muted: #6b7280;"));
assert.ok(html.includes("--border: #e5e7eb;"));
assert.ok(html.includes("--border-subtle: #f1f5f9;"));
assert.ok(html.includes("--success: #16a34a;"));
assert.ok(html.includes("--warning: #f59e0b;"));
assert.ok(html.includes("--error: #dc2626;"));
assert.ok(html.includes("--series-blue: #2563eb;"));
assert.ok(html.includes("--series-purple: #7c3aed;"));
assert.ok(html.includes("--series-orange: #f59e0b;"));
assert.ok(html.includes("--series-teal: #14b8a6;"));
assert.ok(html.includes("--series-slate: #64748b;"));
assert.ok(html.includes("--series-black: #111111;"));
assert.ok(!html.includes("--primary-dark: #4f46e5;"));
assert.ok(!html.includes("--secondary: #ec4899;"));
assert.ok(!html.includes("fonts.googleapis.com"));
assert.ok(html.includes("--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;"));
assert.ok(html.includes("--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"));
assert.ok(html.includes("--font-display: Georgia, 'Times New Roman', serif;"));
assert.ok(html.includes("--text-xs: 0.75rem;"));
assert.ok(html.includes("--text-sm: 0.875rem;"));
assert.ok(html.includes("--text-base: 1rem;"));
assert.ok(html.includes("--text-lg: 1.125rem;"));
assert.ok(html.includes("--text-xl: 1.25rem;"));
assert.ok(html.includes("--text-2xl: 1.5rem;"));

assert.ok(html.includes("--radius-sm: 0.25rem;"));
assert.ok(html.includes("--radius-md: 0.5rem;"));
assert.ok(html.includes("--radius-lg: 0.75rem;"));
assert.ok(html.includes("--radius-xl: 1rem;"));
assert.ok(html.includes("--radius-full: 9999px;"));

console.log("brand plan variable checks passed");
```

**Step 2: Run test to verify it fails**

Run: `node tests/brand-plan.test.js`  
Expected: FAIL with missing `--radius-sm: 0.25rem;`

**Step 3: Write minimal implementation**

```html
    :root {
      --primary: #2563eb;
      --accent: #7c3aed;
      --background: #ffffff;
      --surface: #ffffff;
      --surface-elevated: #f9fafb;
      --text: #111111;
      --text-muted: #6b7280;
      --border: #e5e7eb;
      --border-subtle: #f1f5f9;
      --success: #16a34a;
      --warning: #f59e0b;
      --error: #dc2626;
      --series-blue: #2563eb;
      --series-purple: #7c3aed;
      --series-orange: #f59e0b;
      --series-teal: #14b8a6;
      --series-slate: #64748b;
      --series-black: #111111;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      --font-display: Georgia, 'Times New Roman', serif;
      --text-xs: 0.75rem;
      --text-sm: 0.875rem;
      --text-base: 1rem;
      --text-lg: 1.125rem;
      --text-xl: 1.25rem;
      --text-2xl: 1.5rem;
      --radius-sm: 0.25rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;
      --radius-full: 9999px;
    }
```

**Step 4: Run test to verify it passes**

Run: `node tests/brand-plan.test.js`  
Expected: PASS with `brand plan variable checks passed`

**Step 5: Commit**

```bash
git add tests/brand-plan.test.js before.html
git commit -m "feat(brand): adjust radius scale"
```

---

## Task 4: Simplify components and remove decorative effects

**Files:**
- Modify: `tests/brand-plan.test.js`
- Modify: `before.html:40-370`

**Step 1: Write the failing test**

```javascript
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "before.html"), "utf8");

assert.ok(html.includes("--primary: #2563eb;"));
assert.ok(html.includes("--accent: #7c3aed;"));
assert.ok(html.includes("--background: #ffffff;"));
assert.ok(html.includes("--surface: #ffffff;"));
assert.ok(html.includes("--surface-elevated: #f9fafb;"));
assert.ok(html.includes("--text: #111111;"));
assert.ok(html.includes("--text-muted: #6b7280;"));
assert.ok(html.includes("--border: #e5e7eb;"));
assert.ok(html.includes("--border-subtle: #f1f5f9;"));
assert.ok(html.includes("--success: #16a34a;"));
assert.ok(html.includes("--warning: #f59e0b;"));
assert.ok(html.includes("--error: #dc2626;"));
assert.ok(html.includes("--series-blue: #2563eb;"));
assert.ok(html.includes("--series-purple: #7c3aed;"));
assert.ok(html.includes("--series-orange: #f59e0b;"));
assert.ok(html.includes("--series-teal: #14b8a6;"));
assert.ok(html.includes("--series-slate: #64748b;"));
assert.ok(html.includes("--series-black: #111111;"));
assert.ok(!html.includes("--primary-dark: #4f46e5;"));
assert.ok(!html.includes("--secondary: #ec4899;"));
assert.ok(!html.includes("fonts.googleapis.com"));
assert.ok(html.includes("--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;"));
assert.ok(html.includes("--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"));
assert.ok(html.includes("--font-display: Georgia, 'Times New Roman', serif;"));
assert.ok(html.includes("--text-xs: 0.75rem;"));
assert.ok(html.includes("--text-sm: 0.875rem;"));
assert.ok(html.includes("--text-base: 1rem;"));
assert.ok(html.includes("--text-lg: 1.125rem;"));
assert.ok(html.includes("--text-xl: 1.25rem;"));
assert.ok(html.includes("--text-2xl: 1.5rem;"));
assert.ok(html.includes("--radius-sm: 0.25rem;"));
assert.ok(html.includes("--radius-md: 0.5rem;"));
assert.ok(html.includes("--radius-lg: 0.75rem;"));
assert.ok(html.includes("--radius-xl: 1rem;"));
assert.ok(html.includes("--radius-full: 9999px;"));

assert.ok(!html.includes("linear-gradient"));
assert.ok(!html.includes("radial-gradient"));
assert.ok(!html.includes("backdrop-filter"));
assert.ok(html.includes("background: var(--background);"));
assert.ok(html.includes("border-bottom: 1px solid var(--border-subtle);"));
assert.ok(html.includes(".btn-primary {\n      background: var(--primary);"));
assert.ok(html.includes("box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);"));
assert.ok(html.includes(".btn-secondary:hover {\n      background: var(--surface-elevated);"));
assert.ok(html.includes(".feature-card {\n      background: var(--surface-elevated);"));
assert.ok(html.includes("border-radius: var(--radius-md);"));
assert.ok(html.includes(".feature-icon {\n      width: 48px;\n      height: 48px;\n      background: var(--series-blue);"));
assert.ok(html.includes(".pricing-card {\n      background: var(--background);"));
assert.ok(html.includes(".pricing-card.featured::before {\n      content: 'Most Popular';\n      position: absolute;\n      top: -12px;\n      left: 50%;\n      transform: translateX(-50%);\n      background: var(--series-blue);"));
assert.ok(html.includes(".hero {\n      min-height: 100vh;"));
assert.ok(html.includes("background: var(--background);"));
assert.ok(html.includes(".hero h1 {\n      font-size: 4rem;"));
assert.ok(html.includes("color: var(--text);"));
assert.ok(html.includes("font-family: var(--font-display);"));
assert.ok(html.includes(".stats {\n      padding: 4rem;\n      background: var(--surface-elevated);"));
assert.ok(html.includes("footer {\n      padding: 4rem;\n      background: var(--surface-elevated);"));
assert.ok(html.includes(".alert-success {\n      background: rgba(22, 163, 74, 0.08);"));
assert.ok(html.includes(".alert-error {\n      background: rgba(220, 38, 38, 0.08);"));

console.log("brand plan variable checks passed");
```

**Step 2: Run test to verify it fails**

Run: `node tests/brand-plan.test.js`  
Expected: FAIL with `linear-gradient` still present

**Step 3: Write minimal implementation**

```css
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 4rem;
      background: var(--background);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      border-bottom: 1px solid var(--border-subtle);
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      font-family: var(--font-display);
      color: var(--text);
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .btn-primary:hover {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }

    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--surface-elevated);
      border-color: var(--border);
    }

    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 8rem 2rem 4rem;
      background: var(--background);
    }

    .hero-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      font-size: 0.875rem;
      color: var(--accent);
      margin-bottom: 2rem;
    }

    .hero h1 {
      font-size: 4rem;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      color: var(--text);
      font-family: var(--font-display);
    }

    .feature-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 2rem;
      transition: box-shadow 0.2s, border-color 0.2s;
    }

    .feature-card:hover {
      border-color: var(--border);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      background: var(--series-blue);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: white;
    }

    .stats {
      padding: 4rem;
      background: var(--surface-elevated);
      border-top: 1px solid var(--border-subtle);
      border-bottom: 1px solid var(--border-subtle);
    }

    .stat-item h3 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    .stat-item p {
      font-size: 0.95rem;
      color: var(--text-muted);
    }

    .pricing-card {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 2.5rem;
      position: relative;
    }

    .pricing-card.featured {
      border-color: var(--series-blue);
      box-shadow: none;
    }

    .pricing-card.featured::before {
      content: 'Most Popular';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--series-blue);
      padding: 0.25rem 1rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
    }

    footer {
      padding: 4rem;
      background: var(--surface-elevated);
      border-top: 1px solid var(--border-subtle);
      text-align: center;
    }

    .alert-success {
      background: rgba(22, 163, 74, 0.08);
      border: 1px solid var(--success);
      color: var(--success);
    }

    .alert-error {
      background: rgba(220, 38, 38, 0.08);
      border: 1px solid var(--error);
      color: var(--error);
    }
```

**Step 4: Run test to verify it passes**

Run: `node tests/brand-plan.test.js`  
Expected: PASS with `brand plan variable checks passed`

**Step 5: Commit**

```bash
git add tests/brand-plan.test.js before.html
git commit -m "feat(brand): simplify component styling"
```

---

## Task 5: Voice and tone copy updates

**Files:**
- Modify: `tests/brand-plan.test.js`
- Modify: `before.html:417-545`

**Step 1: Write the failing test**

```javascript
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "before.html"), "utf8");

assert.ok(html.includes("--primary: #2563eb;"));
assert.ok(html.includes("--accent: #7c3aed;"));
assert.ok(html.includes("--background: #ffffff;"));
assert.ok(html.includes("--surface: #ffffff;"));
assert.ok(html.includes("--surface-elevated: #f9fafb;"));
assert.ok(html.includes("--text: #111111;"));
assert.ok(html.includes("--text-muted: #6b7280;"));
assert.ok(html.includes("--border: #e5e7eb;"));
assert.ok(html.includes("--border-subtle: #f1f5f9;"));
assert.ok(html.includes("--success: #16a34a;"));
assert.ok(html.includes("--warning: #f59e0b;"));
assert.ok(html.includes("--error: #dc2626;"));
assert.ok(html.includes("--series-blue: #2563eb;"));
assert.ok(html.includes("--series-purple: #7c3aed;"));
assert.ok(html.includes("--series-orange: #f59e0b;"));
assert.ok(html.includes("--series-teal: #14b8a6;"));
assert.ok(html.includes("--series-slate: #64748b;"));
assert.ok(html.includes("--series-black: #111111;"));
assert.ok(!html.includes("--primary-dark: #4f46e5;"));
assert.ok(!html.includes("--secondary: #ec4899;"));
assert.ok(!html.includes("fonts.googleapis.com"));
assert.ok(html.includes("--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;"));
assert.ok(html.includes("--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"));
assert.ok(html.includes("--font-display: Georgia, 'Times New Roman', serif;"));
assert.ok(html.includes("--text-xs: 0.75rem;"));
assert.ok(html.includes("--text-sm: 0.875rem;"));
assert.ok(html.includes("--text-base: 1rem;"));
assert.ok(html.includes("--text-lg: 1.125rem;"));
assert.ok(html.includes("--text-xl: 1.25rem;"));
assert.ok(html.includes("--text-2xl: 1.5rem;"));
assert.ok(html.includes("--radius-sm: 0.25rem;"));
assert.ok(html.includes("--radius-md: 0.5rem;"));
assert.ok(html.includes("--radius-lg: 0.75rem;"));
assert.ok(html.includes("--radius-xl: 1rem;"));
assert.ok(html.includes("--radius-full: 9999px;"));
assert.ok(!html.includes("linear-gradient"));
assert.ok(!html.includes("radial-gradient"));
assert.ok(!html.includes("backdrop-filter"));

assert.ok(html.includes("Weekly product insights"));
assert.ok(html.includes("Clear analytics for product decisions"));
assert.ok(html.includes("Track adoption, retention, and revenue with dashboards built for focus."));
assert.ok(html.includes("Start free plan"));
assert.ok(html.includes("View product demo"));
assert.ok(html.includes("Metrics that guide product decisions"));
assert.ok(html.includes("Dashboards and reports focused on measurable outcomes."));
assert.ok(html.includes("Insight Summaries"));
assert.ok(html.includes("Weekly summaries highlight shifts in conversion and churn."));
assert.ok(html.includes("Start free, upgrade when volume grows."));
assert.ok(html.includes("Start Starter plan"));
assert.ok(html.includes("Start Pro trial"));

assert.ok(!html.includes("Now with AI-powered insights"));
assert.ok(!html.includes("Analytics that actually make sense"));
assert.ok(!html.includes("Transform your data into actionable insights"));
assert.ok(!html.includes("Everything you need"));
assert.ok(!html.includes("Powerful features to help you"));
assert.ok(!html.includes("Start free, upgrade when you need more power"));

console.log("brand plan variable checks passed");
```

**Step 2: Run test to verify it fails**

Run: `node tests/brand-plan.test.js`  
Expected: FAIL with missing `Weekly product insights`

**Step 3: Write minimal implementation**

```html
  <nav>
    <div class="logo">DataFlow</div>
    <ul class="nav-links">
      <li><a href="#features">Features</a></li>
      <li><a href="#pricing">Pricing</a></li>
      <li><a href="#">Docs</a></li>
      <li><a href="#">Blog</a></li>
    </ul>
    <div class="nav-cta">
      <button class="btn btn-secondary">Sign In</button>
      <button class="btn btn-primary">Start free plan</button>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <span class="hero-badge">Weekly product insights</span>
      <h1>Clear analytics for product decisions</h1>
      <p>Track adoption, retention, and revenue with dashboards built for focus.</p>
      <div class="hero-buttons">
        <button class="btn btn-primary">Start free plan</button>
        <button class="btn btn-secondary">View product demo</button>
      </div>
    </div>
  </section>

  <section class="features" id="features">
    <div class="section-header">
      <h2>Metrics that guide product decisions</h2>
      <p>Dashboards and reports focused on measurable outcomes.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Real-time Dashboards</h3>
        <p>Monitor adoption, activation, and retention as metrics change.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🤖</div>
        <h3>Insight Summaries</h3>
        <p>Weekly summaries highlight shifts in conversion and churn.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔗</div>
        <h3>Integrations</h3>
        <p>Connect your warehouse, product events, and billing data.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">👥</div>
        <h3>Team Collaboration</h3>
        <p>Share review notes and align on metric definitions.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📱</div>
        <h3>Mobile Access</h3>
        <p>Check key metrics during reviews on any device.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Enterprise Security</h3>
        <p>SOC 2 controls with SSO, audit logs, and data residency options.</p>
      </div>
    </div>
  </section>

  <section class="pricing" id="pricing">
    <div class="section-header">
      <h2>Simple, transparent pricing</h2>
      <p>Start free, upgrade when volume grows.</p>
    </div>
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Starter</h3>
        <div class="price">$0<span>/month</span></div>
        <ul class="pricing-features">
          <li>Up to 10K events/month</li>
          <li>3 team members</li>
          <li>Basic dashboards</li>
          <li>Email support</li>
        </ul>
        <button class="btn btn-secondary">Start Starter plan</button>
      </div>
      <div class="pricing-card featured">
        <h3>Pro</h3>
        <div class="price">$49<span>/month</span></div>
        <ul class="pricing-features">
          <li>Up to 1M events/month</li>
          <li>Unlimited team members</li>
          <li>Advanced dashboards</li>
          <li>AI insights</li>
          <li>Priority support</li>
        </ul>
        <button class="btn btn-primary">Start Pro trial</button>
      </div>
      <div class="pricing-card">
        <h3>Enterprise</h3>
        <div class="price">Custom</div>
        <ul class="pricing-features">
          <li>Unlimited events</li>
          <li>Dedicated infrastructure</li>
          <li>Custom integrations</li>
          <li>SSO &amp; SAML</li>
          <li>Dedicated support</li>
        </ul>
        <button class="btn btn-secondary">Contact Sales</button>
      </div>
    </div>
  </section>
```

**Step 4: Run test to verify it passes**

Run: `node tests/brand-plan.test.js`  
Expected: PASS with `brand plan variable checks passed`

**Step 5: Commit**

```bash
git add tests/brand-plan.test.js before.html
git commit -m "feat(brand): align copy with nof1 voice"
```

---

## Post-implementation validation

Open `before.html` in a browser and confirm: background is white/light; no gradients or glowing shadows remain; text is dark on light background; border radius feels subtle (4–16px); typography uses system fonts; cards have subtle elevation; buttons are solid colors; overall feel is calm, precise, data-focused.
