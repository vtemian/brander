# nof1 Brand Transformation Implementation Plan

**Goal:** Transform the landing page from dark/gradient marketing style to the nof1 research-lab aesthetic.

**Architecture:** Single HTML file transformation - update CSS variables, remove gradients, apply system fonts with serif display headings.

**Design:** Direct transformation based on nof1 brand definition at `/Users/whitemonk/projects/config/brander/brands/nof1.json`

---

## Task 1: Update CSS Variables (:root block)

**Files:**
- Modify: `before.html:8-27` (CSS :root block)

**Step 1: Create the output file**

Copy `before.html` to `after.html` to preserve the original:

```bash
cp before.html after.html
```

**Step 2: Replace the :root CSS variables block**

In `after.html`, replace lines 8-27 with the nof1 design tokens:

```css
    :root {
      /* nof1 color palette */
      --ink: #111111;
      --paper: #ffffff;
      --muted: #6b7280;
      --border: #e5e7eb;
      --border-subtle: #f1f5f9;
      --surface-elevated: #f9fafb;
      
      /* Semantic colors */
      --background: #ffffff;
      --surface: #ffffff;
      --foreground: #111111;
      --foreground-muted: #6b7280;
      --foreground-subtle: #9ca3af;
      
      /* State colors */
      --success: #16a34a;
      --warning: #f59e0b;
      --error: #dc2626;
      
      /* Data visualization (for accent use) */
      --series-blue: #2563eb;
      
      /* Typography */
      --font-display: Georgia, 'Times New Roman', serif;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      
      /* Border radius - nof1 uses smaller, more subtle radii */
      --radius-sm: 0.25rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;
    }
```

**Step 3: Verify the change**

Run: `grep -n "ink\|paper\|font-display" after.html | head -5`
Expected: Lines showing the new nof1 variables

**Step 4: Commit**

```bash
git add after.html
git commit -m "feat(nof1): replace CSS variables with nof1 design tokens"
```

---

## Task 2: Remove Google Fonts Import

**Files:**
- Modify: `after.html:29`

**Step 1: Remove the Google Fonts import line**

Delete line 29 (the @import statement for Poppins and Fira Code):

```css
/* DELETE THIS LINE: */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Fira+Code&display=swap');
```

**Step 2: Verify removal**

Run: `grep -n "fonts.googleapis" after.html`
Expected: No output (import removed)

**Step 3: Commit**

```bash
git add after.html
git commit -m "feat(nof1): remove Google Fonts import, use system fonts"
```

---

## Task 3: Update Body Styles

**Files:**
- Modify: `after.html:33-38` (body styles)

**Step 1: Update body styles for light theme**

Replace the body styles:

```css
    body {
      font-family: var(--font-sans);
      background: var(--background);
      color: var(--foreground);
      line-height: 1.5;
    }
```

**Step 2: Verify the change**

Run: `grep -A4 "^    body {" after.html`
Expected: Shows new body styles with --background and --foreground

**Step 3: Commit**

```bash
git add after.html
git commit -m "feat(nof1): update body styles for light theme"
```

---

## Task 4: Transform Navigation

**Files:**
- Modify: `after.html:40-63` (nav and logo styles)

**Step 1: Update nav styles - remove blur, use solid white background**

Replace the nav styles (lines 41-54):

```css
    /* Navigation */
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
      border-bottom: 1px solid var(--border);
    }
```

**Step 2: Update logo styles - use serif font, remove gradient**

Replace the logo styles (lines 56-63):

```css
    .logo {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 400;
      color: var(--foreground);
      letter-spacing: -0.02em;
    }
```

**Step 3: Update nav link colors**

Replace nav-links a styles (lines 71-80):

```css
    .nav-links a {
      color: var(--foreground-muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-links a:hover {
      color: var(--foreground);
    }
```

**Step 4: Verify the changes**

Run: `grep -A5 "\.logo {" after.html`
Expected: Shows serif font-family, no gradient

**Step 5: Commit**

```bash
git add after.html
git commit -m "feat(nof1): transform nav to solid white with serif logo"
```

---

## Task 5: Transform Buttons

**Files:**
- Modify: `after.html:87-119` (button styles)

**Step 1: Update base button styles**

Replace the .btn styles:

```css
    /* Buttons */
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md);
      font-family: var(--font-sans);
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
```

**Step 2: Update primary button - solid color, no gradient**

Replace .btn-primary styles:

```css
    .btn-primary {
      background: var(--foreground);
      color: var(--background);
    }

    .btn-primary:hover {
      background: var(--muted);
    }
```

**Step 3: Update secondary button**

Replace .btn-secondary styles:

```css
    .btn-secondary {
      background: transparent;
      color: var(--foreground);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--surface-elevated);
      border-color: var(--foreground-muted);
    }
```

**Step 4: Verify the changes**

Run: `grep -A3 "\.btn-primary {" after.html`
Expected: Shows solid background, no gradient or shadow

**Step 5: Commit**

```bash
git add after.html
git commit -m "feat(nof1): transform buttons to solid colors, remove gradients"
```

---

## Task 6: Transform Hero Section

**Files:**
- Modify: `after.html:121-173` (hero styles)

**Step 1: Update hero section - remove gradient backgrounds**

Replace .hero styles:

```css
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 8rem 2rem 4rem;
      background: var(--background);
    }
```

**Step 2: Update hero badge - subtle styling**

Replace .hero-badge styles:

```css
    .hero-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      font-size: 0.875rem;
      color: var(--foreground-muted);
      margin-bottom: 2rem;
    }
```

**Step 3: Update hero h1 - serif font, no gradient, smaller size**

Replace .hero h1 styles:

```css
    .hero h1 {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 400;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      color: var(--foreground);
      letter-spacing: -0.02em;
    }
```

**Step 4: Update hero paragraph**

Replace .hero p styles:

```css
    .hero p {
      font-size: 1.125rem;
      color: var(--foreground-muted);
      margin-bottom: 2.5rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
```

**Step 5: Verify the changes**

Run: `grep -A6 "\.hero h1 {" after.html`
Expected: Shows serif font-family, 2.5rem size, no gradient

**Step 6: Commit**

```bash
git add after.html
git commit -m "feat(nof1): transform hero to calm serif heading, remove gradients"
```

---

## Task 7: Transform Features Section

**Files:**
- Modify: `after.html:175-240` (features styles)

**Step 1: Update features section background**

Replace .features styles:

```css
    /* Features Section */
    .features {
      padding: 6rem 4rem;
      background: var(--surface-elevated);
    }
```

**Step 2: Update section header**

Replace .section-header styles:

```css
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-header h2 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 400;
      margin-bottom: 1rem;
      color: var(--foreground);
    }

    .section-header p {
      color: var(--foreground-muted);
      font-size: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }
```

**Step 3: Update feature cards - remove hover lift, subtle styling**

Replace .feature-card styles:

```css
    .feature-card {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      transition: border-color 0.2s;
    }

    .feature-card:hover {
      border-color: var(--foreground-muted);
    }
```

**Step 4: Update feature icon - solid color, no gradient**

Replace .feature-icon styles:

```css
    .feature-icon {
      width: 48px;
      height: 48px;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }
```

**Step 5: Update feature card text**

Replace .feature-card h3 and p styles:

```css
    .feature-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--foreground);
    }

    .feature-card p {
      color: var(--foreground-muted);
      font-size: 0.95rem;
    }
```

**Step 6: Verify the changes**

Run: `grep -A4 "\.feature-card:hover {" after.html`
Expected: Shows border-color change only, no transform

**Step 7: Commit**

```bash
git add after.html
git commit -m "feat(nof1): transform feature cards to subtle styling, remove lifts"
```

---

## Task 8: Transform Stats Section

**Files:**
- Modify: `after.html:242-266` (stats styles)

**Step 1: Update stats section - remove gradient, use subtle background**

Replace .stats styles:

```css
    /* Stats Section */
    .stats {
      padding: 4rem;
      background: var(--surface-elevated);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
```

**Step 2: Update stat items**

Replace .stat-item styles:

```css
    .stat-item h3 {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 400;
      margin-bottom: 0.5rem;
      color: var(--foreground);
    }

    .stat-item p {
      font-size: 0.95rem;
      color: var(--foreground-muted);
    }
```

**Step 3: Verify the changes**

Run: `grep -A3 "\.stats {" after.html`
Expected: Shows surface-elevated background, no gradient

**Step 4: Commit**

```bash
git add after.html
git commit -m "feat(nof1): transform stats section to subtle background"
```

---

## Task 9: Transform Pricing Section

**Files:**
- Modify: `after.html:268-341` (pricing styles)

**Step 1: Update pricing section**

Replace .pricing styles:

```css
    /* Pricing Section */
    .pricing {
      padding: 6rem 4rem;
      background: var(--background);
    }
```

**Step 2: Update pricing cards**

Replace .pricing-card styles:

```css
    .pricing-card {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      position: relative;
    }

    .pricing-card.featured {
      border-color: var(--foreground);
    }
```

**Step 3: Update featured badge - solid color, no gradient**

Replace .pricing-card.featured::before styles:

```css
    .pricing-card.featured::before {
      content: 'Most Popular';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--foreground);
      color: var(--background);
      padding: 0.25rem 1rem;
      border-radius: var(--radius-xl);
      font-size: 0.75rem;
      font-weight: 600;
    }
```

**Step 4: Update pricing card text**

Replace pricing card text styles:

```css
    .pricing-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--foreground);
    }

    .pricing-card .price {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 400;
      margin: 1rem 0;
      color: var(--foreground);
    }

    .pricing-card .price span {
      font-family: var(--font-sans);
      font-size: 1rem;
      font-weight: 400;
      color: var(--foreground-muted);
    }
```

**Step 5: Update pricing features list**

Replace .pricing-features styles:

```css
    .pricing-features {
      list-style: none;
      margin: 2rem 0;
    }

    .pricing-features li {
      padding: 0.5rem 0;
      color: var(--foreground-muted);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .pricing-features li::before {
      content: '\2713';
      color: var(--success);
      font-weight: bold;
    }
```

**Step 6: Verify the changes**

Run: `grep -A5 "\.pricing-card.featured::before {" after.html`
Expected: Shows solid foreground background, no gradient

**Step 7: Commit**

```bash
git add after.html
git commit -m "feat(nof1): transform pricing cards to solid styling"
```

---

## Task 10: Transform Footer

**Files:**
- Modify: `after.html:343-370` (footer styles)

**Step 1: Update footer styles**

Replace footer styles:

```css
    /* Footer */
    footer {
      padding: 4rem;
      background: var(--background);
      border-top: 1px solid var(--border);
      text-align: center;
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-links a {
      color: var(--foreground-muted);
      text-decoration: none;
    }

    .footer-links a:hover {
      color: var(--foreground);
    }

    .footer-copy {
      color: var(--foreground-subtle);
      font-size: 0.875rem;
    }
```

**Step 2: Verify the changes**

Run: `grep -A3 "^    footer {" after.html`
Expected: Shows background variable, no surface color

**Step 3: Commit**

```bash
git add after.html
git commit -m "feat(nof1): transform footer to clean styling"
```

---

## Task 11: Transform Alerts

**Files:**
- Modify: `after.html:372-390` (alert styles)

**Step 1: Update alert styles with nof1 state colors**

Replace alert styles:

```css
    /* Alerts */
    .alert {
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      margin: 1rem 0;
      display: none;
    }

    .alert-success {
      background: rgba(22, 163, 74, 0.1);
      border: 1px solid var(--success);
      color: var(--success);
    }

    .alert-error {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid var(--error);
      color: var(--error);
    }
```

**Step 2: Verify the changes**

Run: `grep -A3 "\.alert-success {" after.html`
Expected: Shows nof1 success color (#16a34a in rgba)

**Step 3: Commit**

```bash
git add after.html
git commit -m "feat(nof1): update alerts with nof1 state colors"
```

---

## Task 12: Update Responsive Styles

**Files:**
- Modify: `after.html:392-413` (responsive styles)

**Step 1: Update responsive hero h1 size**

Replace the responsive styles:

```css
    /* Responsive */
    @media (max-width: 768px) {
      nav {
        padding: 1rem 2rem;
      }

      .nav-links {
        display: none;
      }

      .hero h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .features, .pricing {
        padding: 4rem 2rem;
      }
    }
```

**Step 2: Verify the changes**

Run: `grep -A2 "\.hero h1 {" after.html | tail -3`
Expected: Shows 2rem font-size in media query

**Step 3: Commit**

```bash
git add after.html
git commit -m "feat(nof1): update responsive styles for smaller heading"
```

---

## Task 13: Final Verification and Commit

**Step 1: Verify all gradients are removed**

Run: `grep -n "linear-gradient\|radial-gradient" after.html`
Expected: No output (all gradients removed)

**Step 2: Verify all old color variables are replaced**

Run: `grep -n "var(--primary)\|var(--secondary)\|var(--accent)\|var(--text)" after.html`
Expected: No output (all old variables replaced)

**Step 3: Verify Google Fonts import is removed**

Run: `grep -n "fonts.googleapis" after.html`
Expected: No output

**Step 4: Verify backdrop-filter is removed**

Run: `grep -n "backdrop-filter" after.html`
Expected: No output

**Step 5: Verify translateY transforms are removed**

Run: `grep -n "translateY" after.html`
Expected: Only the pricing badge transform (translateX) should remain

**Step 6: Visual verification**

Open `after.html` in a browser and verify:
- [ ] White background throughout
- [ ] Serif font on logo and headings
- [ ] No gradients anywhere
- [ ] Subtle borders and shadows
- [ ] Calm, research-lab aesthetic

**Step 7: Final commit**

```bash
git add after.html
git commit -m "feat(nof1): complete brand transformation to nof1 aesthetic"
```

---

## Summary

This plan transforms the landing page in 13 incremental tasks:

| Task | Component | Key Changes |
|------|-----------|-------------|
| 1 | CSS Variables | Replace all color/font/radius tokens with nof1 values |
| 2 | Fonts | Remove Google Fonts, use system fonts |
| 3 | Body | Light background, dark text |
| 4 | Navigation | Solid white, serif logo, remove blur |
| 5 | Buttons | Solid colors, no gradients or shadows |
| 6 | Hero | Serif heading, smaller size, no gradients |
| 7 | Features | Subtle cards, no hover lifts |
| 8 | Stats | Neutral background, no gradient |
| 9 | Pricing | Solid badge, clean cards |
| 10 | Footer | Clean styling |
| 11 | Alerts | nof1 state colors |
| 12 | Responsive | Adjusted heading sizes |
| 13 | Verification | Confirm all changes applied |

**Total estimated time:** 30-45 minutes

**Files affected:** 1 (before.html -> after.html)

**Lines changed:** ~200 lines of CSS
