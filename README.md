# opencode-reskin

An OpenCode plugin that generates brand transformation plans for web projects.

```
/brand nof1
```

https://github.com/user-attachments/assets/1baafe10-f259-45f3-8fca-a203f41cc0ca

| Before | After |
|--------|-------|
| [Original DataFlow](https://htmlpreview.github.io/?https://github.com/vtemian/opencode-reskin/blob/main/example/before.html) | [nof1 Brand](https://htmlpreview.github.io/?https://github.com/vtemian/opencode-reskin/blob/main/example/after.html) |

## Available Brands

| Brand | Style | Preview |
|-------|-------|---------|
| `nof1` | Neutral dashboard, chart-focused | [View](https://htmlpreview.github.io/?https://github.com/vtemian/opencode-reskin/blob/main/brands/brand.html#b=nof1) |

## Quick Start

Add to `~/.config/opencode/opencode.json`:

```json
{ "plugin": ["opencode-reskin"] }
```

Run the brand command:

```
/brand nof1
```

## What It Does

When you run `/brand {name}`, opencode-reskin:

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

## Architecture: 3 Agents

| Agent | Job |
|-------|-----|
| **opencode-reskin** | Orchestrates analysis, generates plan |
| **style-analyzer** | Scans CSS, Tailwind, design tokens |
| **component-scanner** | Finds UI components and their styling |

Subagents analyze your project in parallel, then opencode-reskin compares findings against the brand definition.

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

Optional config at `~/.config/opencode/opencode-reskin.json`:

```json
{
  "agents": {
    "opencode-reskin": { "model": "anthropic/claude-opus-4" }
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
