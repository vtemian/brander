---
date: 2026-01-03
topic: "Brander - Brand Transformation Plugin"
status: validated
---

# Brander Design

## Problem Statement

Developers need a way to consistently apply curated brand guidelines to web projects. Currently, transforming a project to match a specific design system requires manual analysis and tedious file-by-file changes.

Brander solves this by:
1. Providing curated brand definitions (starting with nof1/OpenCode OC-1)
2. Analyzing the current project's styling
3. Generating a structured transformation plan

## Constraints

- **Web projects only** - React, Vue, Angular, CSS, Tailwind
- **Plan generation only** - Agent outputs a checklist, doesn't apply changes
- **Bundled brands** - Brand definitions ship with the plugin, manually curated
- **XML format** - Brand definitions are XML files for easy prompt embedding

## Approach

Build an OpenCode plugin following the micode pattern with:
- A primary `brander` agent that orchestrates analysis
- Two subagents for parallel project scanning
- Bundled XML brand definitions
- A single `/brand` command with optional argument

## Architecture

```
brander/
├── src/
│   ├── index.ts              # Plugin entry point
│   ├── agents/
│   │   ├── index.ts          # Agent registry
│   │   ├── brander.ts        # Main orchestrator agent
│   │   ├── style-analyzer.ts # CSS/Tailwind analysis subagent
│   │   └── component-scanner.ts # Component pattern subagent
│   └── brands/
│       ├── index.ts          # Brand loader (reads XML at startup)
│       ├── schema.ts         # TypeScript types for brand structure
│       └── nof1.xml          # Bundled nof1 brand definition
├── package.json
├── tsconfig.json
└── biome.json
```

## Components

### 1. Brander Agent (Primary)

| Property | Value |
|----------|-------|
| Mode | `primary` |
| Model | `claude-sonnet-4-20250514` |
| Temperature | `0.1` |
| Tools | Read-only (`write: false`, `edit: false`) |

**Responsibilities:**
- Parse command argument or show brand picker
- Load selected brand XML into context
- Spawn subagents to analyze project
- Generate transformation plan

### 2. Style Analyzer (Subagent)

| Property | Value |
|----------|-------|
| Mode | `subagent` |
| Tools | Read-only |

**Responsibilities:**
- Find CSS files, CSS variables, Tailwind config
- Extract current color palette, fonts, spacing
- Identify design token patterns

### 3. Component Scanner (Subagent)

| Property | Value |
|----------|-------|
| Mode | `subagent` |
| Tools | Read-only |

**Responsibilities:**
- Find UI components (buttons, cards, forms)
- Identify component library in use (if any)
- Extract current component styling patterns

### 4. Brand Loader

- Scans `src/brands/` at plugin startup
- Parses XML files into structured objects
- Provides brand list and lookup functions

### 5. Command Registration

| Command | Description |
|---------|-------------|
| `/brand` | No arg: show picker. With arg: use that brand |

## Brand XML Schema

```xml
<brand name="nof1" version="1.0">
  <meta>
    <description>OpenCode OC-1 design system</description>
    <target>web</target>
  </meta>

  <!-- Required sections -->

  <colors>
    <palette name="primary" value="#dcde8d" description="Yuzu yellow-green"/>
    <palette name="interactive" value="#034cff" description="Cobalt blue"/>
    <palette name="neutral" value="#8e8b8b"/>
    <palette name="success" value="#12c905"/>
    <palette name="warning" value="#ffdc17"/>
    <palette name="error" value="#fc533a"/>
    <palette name="info" value="#a753ae"/>
    <semantic name="background" light="#ffffff" dark="#1a1a1a"/>
    <semantic name="foreground" light="#1a1a1a" dark="#ffffff"/>
    <semantic name="border" light="#e5e5e5" dark="#333333"/>
  </colors>

  <typography>
    <font role="sans" family="Inter" fallback="system-ui, sans-serif"/>
    <font role="mono" family="IBM Plex Mono" fallback="monospace"/>
    <scale name="base" size="14px" line-height="1.5"/>
    <scale name="sm" size="13px" line-height="1.4"/>
    <scale name="lg" size="16px" line-height="1.5"/>
  </typography>

  <spacing unit="0.25rem"/>

  <radius>
    <size name="xs" value="0.125rem"/>
    <size name="sm" value="0.25rem"/>
    <size name="md" value="0.375rem"/>
    <size name="lg" value="0.5rem"/>
    <size name="xl" value="0.625rem"/>
  </radius>

  <!-- Optional sections -->

  <components>
    <button variant="primary" bg="interactive" text="white" radius="md"/>
    <button variant="secondary" bg="transparent" text="interactive" border="interactive"/>
    <card bg="background" border="border" radius="lg" padding="4"/>
  </components>

  <voice>
    <tone>Direct, technical, no fluff</tone>
    <principles>
      <principle>Be concise</principle>
      <principle>Use active voice</principle>
    </principles>
  </voice>

  <guidelines>
    <do>Use consistent spacing multiples</do>
    <do>Prefer semantic color names over raw values</do>
    <dont>Mix font families within body text</dont>
    <dont>Use more than 3 levels of elevation</dont>
  </guidelines>
</brand>
```

**Required sections:** `meta`, `colors`, `typography`, `spacing`, `radius`

**Optional sections:** `components`, `voice`, `guidelines`

## Data Flow

1. User invokes `/brand nof1` (or `/brand` for picker)
2. Plugin loads `nof1.xml` from bundled brands
3. Brander agent receives brand XML in system prompt
4. Agent spawns subagents in parallel:
   - `style-analyzer` scans CSS/Tailwind
   - `component-scanner` scans components
5. Subagents return findings
6. Brander compares current state vs brand definition
7. Agent outputs transformation plan

## Transformation Plan Output Format

```markdown
# Brand Transformation Plan: nof1

## Summary
- **Current state**: Tailwind with default palette, system fonts
- **Target brand**: nof1 (OpenCode OC-1)
- **Estimated scope**: 12 files, ~45 changes

## 1. Colors

### CSS Variables (src/styles/variables.css)
- [ ] Add `--color-primary: #dcde8d`
- [ ] Add `--color-interactive: #034cff`
- [ ] Replace `--blue-500` references with `--color-interactive`

### Tailwind Config (tailwind.config.js)
- [ ] Add `colors.primary: '#dcde8d'`
- [ ] Add `colors.interactive: '#034cff'`
- [ ] Update `colors.gray` to match neutral palette

## 2. Typography

### Font Setup
- [ ] Add Inter font (Google Fonts or local)
- [ ] Add IBM Plex Mono font
- [ ] Update `--font-sans` to `'Inter', system-ui, sans-serif`
- [ ] Update `--font-mono` to `'IBM Plex Mono', monospace`

### Font Sizes
- [ ] Set base font size to 14px
- [ ] Adjust scale: sm=13px, base=14px, lg=16px

## 3. Spacing & Radius

- [ ] Verify spacing unit is 0.25rem (Tailwind default matches)
- [ ] Update border-radius scale: xs=0.125rem through xl=0.625rem

## 4. Components

### Buttons (src/components/Button.tsx)
- [ ] Primary: bg-interactive, text-white, rounded-md
- [ ] Secondary: bg-transparent, text-interactive, border-interactive

### Cards (src/components/Card.tsx)
- [ ] Apply rounded-lg, border-border, p-4

## 5. Optional: Voice & Tone

- [ ] Review button labels for conciseness
- [ ] Check error messages match direct tone

---
Generated by brander | Brand: nof1 v1.0
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Unknown brand name | List available brands, ask user to pick |
| No style files found | Report "No CSS/Tailwind files found" in plan |
| Project already matches brand | Report "Project already aligned with brand" |

## Testing Strategy

1. **Unit tests** - Brand XML parsing, schema validation
2. **Integration tests** - Full agent flow with mock project structures
3. **Snapshot tests** - Transformation plan output format consistency

## Open Questions

None at this time.
