# brander

An OpenCode plugin that generates brand transformation plans for web projects.

**Hours of manual brand comparison → 2 minutes of agent analysis.**

## Quick Start

Add to `~/.config/opencode/opencode.json`:

```json
{ "plugin": ["brander"] }
```

Run the brand command:

```
/brand nof1
```

## What It Does

When you run `/brand {name}`, brander:

- Scans your CSS, Tailwind config, and components
- Compares against the target brand definition
- Outputs an actionable checklist with exact file paths and values

The output is a markdown plan you can execute:

```markdown
## 1. Colors

### CSS Variables (src/styles/globals.css)
- [ ] Change `--background: #0f172a` → `#ffffff`
- [ ] Change `--foreground: #f8fafc` → `#111111`

### Tailwind Config (tailwind.config.js)
- [ ] Update `colors.background` to `#ffffff`
```

## Available Brands

| Brand | Style | Use Case |
|-------|-------|----------|
| `nof1` | Neutral dashboard, chart-focused | Data visualization apps |

## Architecture: 3 Agents

| Agent | Job |
|-------|-----|
| **brander** | Orchestrates analysis, generates plan |
| **style-analyzer** | Scans CSS, Tailwind, design tokens |
| **component-scanner** | Finds UI components and their styling |

Subagents analyze your project in parallel, then brander compares findings against the brand definition.

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

Optional config at `~/.config/opencode/brander.json`:

```json
{
  "agents": {
    "brander": { "model": "anthropic/claude-opus-4" }
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
