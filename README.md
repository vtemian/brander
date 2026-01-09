# brander

An OpenCode plugin that generates brand transformation plans for web projects.

## The Problem

Applying a design system to an existing project is tedious:

```
- Open brand guidelines PDF
- Find your CSS variables file
- Manually map colors one by one
- Check Tailwind config
- Update component styles
- Miss half the places that need changes
- Repeat when you find inconsistencies
```

Hours of manual comparison. Easy to miss things.

## The Solution

**An agent that analyzes your codebase and generates a complete transformation plan.**

When you run `/brand nof1`, brander:

- Scans your CSS, Tailwind config, and components
- Compares against the target brand definition
- Outputs an actionable checklist with exact file paths and values

**Hours of manual work → 2 minutes of agent analysis.**

## Quick Start

Add to `~/.config/opencode/opencode.json`:

```json
{ "plugin": ["brander"] }
```

Run the brand command:

```
/brand nof1
```

Get a transformation plan you can execute.

## The Output

A markdown checklist with specific, actionable items:

```markdown
# Brand Transformation Plan: nof1

## Summary
- **Current state**: Dark gradient theme, Poppins font
- **Target brand**: nof1 (neutral dashboard)
- **Estimated scope**: 8 files, ~35 changes

## 1. Colors

### CSS Variables (src/styles/globals.css)
- [ ] Change `--background: #0f172a` → `#ffffff`
- [ ] Change `--foreground: #f8fafc` → `#111111`
- [ ] Add `--color-muted: #6b7280`

### Tailwind Config (tailwind.config.js)
- [ ] Update `colors.background` to `#ffffff`
- [ ] Add semantic color tokens

## 2. Typography

- [ ] Replace Poppins with system-ui
- [ ] Add serif font for display headings
...
```

## Available Brands

| Brand | Style | Use Case |
|-------|-------|----------|
| **nof1** | Neutral dashboard, chart-focused | Data visualization apps |

## How It Works

### 3 Agents

| Agent | Job |
|-------|-----|
| **brander** | Orchestrates analysis, generates plan |
| **style-analyzer** | Scans CSS, Tailwind, design tokens |
| **component-scanner** | Finds UI components and their styling |

### The Flow

1. You specify a target brand
2. Subagents analyze your project in parallel
3. Brander compares findings against brand definition
4. Transformation plan generated with exact changes

## Adding Brands

Brands are JSON files in `brands/`. Required fields:

```json
{
  "name": "my-brand",
  "version": "1.0",
  "meta": { "target": "web" },
  "colors": { "palette": [...], "semantic": [...] },
  "typography": { "fonts": [...], "scale": [...] },
  "spacing": { "unit": "0.25rem" },
  "radius": { "sizes": [...] }
}
```

Optional: `dataViz`, `states`, `voice`, `guidelines`

## Configuration

Optional `~/.config/opencode/brander.json`:

```json
{
  "agents": {
    "brander": { "model": "anthropic/claude-sonnet-4" }
  }
}
```

## Development

```bash
bun install
bun run build
bun test
```

## License

MIT
