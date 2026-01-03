# Brander

OpenCode plugin for applying curated brand guidelines to web projects.

## What it does

Brander analyzes your web project's current styling (CSS, Tailwind, components) and generates a transformation plan to match a target brand. It doesn't modify files directly - it outputs an actionable checklist.

## Installation

```bash
# Add to your OpenCode config
opencode plugin add brander
```

## Usage

```bash
# List available brands and pick one
/brand

# Apply a specific brand
/brand nof1
```

## Available Brands

- **nof1** - OpenCode OC-1 design system (Inter font, yuzu/cobalt colors)

## What the plan includes

- **Colors** - CSS variables, Tailwind config changes, semantic mappings
- **Typography** - Font families, sizes, line heights
- **Spacing & Radius** - Base units, border radius scale
- **Components** - Button, card, input styling updates
- **Voice & Tone** - Copy guidelines (if defined in brand)

## Example output

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

### Tailwind Config (tailwind.config.js)
- [ ] Add `colors.primary: '#dcde8d'`
...
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Typecheck
bun run typecheck
```

## Architecture

```
src/
├── index.ts              # Plugin entry point
├── agents/
│   ├── brander.ts        # Primary agent - orchestrates analysis
│   ├── style-analyzer.ts # Subagent - CSS/Tailwind analysis
│   └── component-scanner.ts # Subagent - UI component analysis
├── brands/
│   ├── schema.ts         # TypeScript types for brand definitions
│   ├── parser.ts         # XML parser for brand files
│   ├── index.ts          # Brand loader
│   └── nof1.xml          # Bundled nof1 brand definition
└── hooks/
    └── brand-injector.ts # Injects brand XML into agent context
```

## Adding brands

Brands are defined in XML format in `src/brands/`. See `nof1.xml` for the full schema.

Required sections: `meta`, `colors`, `typography`, `spacing`, `radius`

Optional sections: `components`, `voice`, `guidelines`

## License

MIT
