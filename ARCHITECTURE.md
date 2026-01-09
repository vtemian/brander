# Brander Architecture

## Overview

Brander is an OpenCode plugin that analyzes web projects and generates brand transformation plans. It reads brand definitions from XML files and uses AI agents to analyze a project's current styling (CSS, Tailwind, components), then outputs an actionable checklist to match the target brand.

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript (ES2022) |
| Runtime | Bun |
| Build | Bun bundler + tsc (declarations only) |
| Testing | Bun test |
| Linting/Formatting | Biome |
| Package Manager | Bun |

**Key Dependencies:**
- `@opencode-ai/plugin` - Plugin SDK for OpenCode integration

## Directory Structure

```
brander/
├── src/
│   ├── index.ts              # Plugin entry point, registers agents/commands/hooks
│   ├── agents/               # AI agent configurations
│   │   ├── index.ts          # Agent registry and exports
│   │   ├── brander.ts        # Primary orchestrator agent
│   │   ├── style-analyzer.ts # CSS/Tailwind analysis subagent
│   │   └── component-scanner.ts # UI component analysis subagent
│   ├── brands/               # Brand definition system
│   │   ├── index.ts          # Brand loader (loadBrands, getBrand, listBrands)
│   │   ├── schema.ts         # TypeScript type definitions
│   │   ├── parser.ts         # Custom XML parser (regex-based, no deps)
│   │   └── nof1.xml          # Bundled brand definition
│   └── hooks/
│       └── brand-injector.ts # Injects brand XML into agent prompts
├── tests/                    # Test files (mirrors src/ structure)
│   ├── agents/
│   ├── brands/
│   ├── index.test.ts
│   ├── integration.test.ts
│   └── brand-injection.test.ts
├── dist/                     # Build output (ESM + .d.ts)
├── thoughts/shared/          # Design documents and plans
├── package.json
├── tsconfig.json
└── biome.json
```

## Core Components

### 1. Plugin Entry (`src/index.ts`)

**Responsibility:** Initialize plugin, register agents, commands, and hooks.

**Lifecycle:**
1. Load all brand XML files at startup via `loadBrands()`
2. Create brand injector hook
3. Return config callback that registers:
   - All agents from `src/agents/`
   - `/brand` command with template
   - `chat.message` and `chat.params` hooks

### 2. Brands Module (`src/brands/`)

**Responsibility:** Load, parse, and store brand definitions.

| File | Purpose |
|------|---------|
| `index.ts` | Brand storage (two Maps) and public API |
| `schema.ts` | TypeScript interfaces for brand structure |
| `parser.ts` | Custom XML parser using regex |
| `*.xml` | Brand definition files |

**Key Functions:**
- `loadBrands()` - Reads all `.xml` files from brands directory
- `getBrand(name)` - Returns parsed `Brand` object
- `getBrandXml(name)` - Returns raw XML string
- `listBrands()` - Returns array of loaded brand names

**Brand Schema (required sections):**
- `meta` - description, target (web/mobile/all)
- `colors` - palette and semantic colors
- `typography` - fonts and scale
- `spacing` - base unit
- `radius` - border radius sizes

**Optional sections:** `components`, `voice`, `guidelines`

### 3. Agents Module (`src/agents/`)

**Responsibility:** Define AI agent configurations for brand analysis.

| Agent | Mode | Purpose |
|-------|------|---------|
| `brander` | primary | Orchestrates analysis, spawns subagents, generates plan |
| `style-analyzer` | subagent | Analyzes CSS, Tailwind, design tokens |
| `component-scanner` | subagent | Scans UI components, identifies patterns |

**Agent Workflow:**
1. User invokes `/brand [name]`
2. `brander` agent spawns `style-analyzer` and `component-scanner` in parallel
3. Subagents return findings
4. `brander` compares findings against brand definition
5. Outputs transformation checklist

### 4. Hooks Module (`src/hooks/`)

**Responsibility:** Intercept chat messages and inject brand context.

**Brand Injector Hook:**
- `chat.message` - Extracts brand name from `/brand [name]` command
- `chat.params` - Replaces `$BRAND_XML` placeholder in agent prompts with actual XML

**State:** Uses a Map to track brand requests per session (cleaned up after injection).

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User: /brand nof1                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  chat.message hook                                                      │
│  - Extracts "nof1" from command                                         │
│  - Stores in brandRequests Map                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  chat.params hook                                                       │
│  - Retrieves brand XML via getBrandXml("nof1")                          │
│  - Replaces $BRAND_XML in brander agent prompt                          │
│  - Clears session state                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  brander agent (primary)                                                │
│  - Has brand XML in system prompt                                       │
│  - Spawns subagents in parallel                                         │
└─────────────────────────────────────────────────────────────────────────┘
                    │                               │
                    ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │  style-analyzer           │   │  component-scanner        │
    │  - Finds CSS files        │   │  - Finds UI components    │
    │  - Analyzes Tailwind      │   │  - Identifies patterns    │
    │  - Extracts tokens        │   │  - Detects framework      │
    └───────────────────────────┘   └───────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  brander agent                                                          │
│  - Compares findings vs brand definition                                │
│  - Generates transformation plan                                        │
│  - Outputs actionable checklist                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## External Integrations

| Integration | Purpose |
|-------------|---------|
| OpenCode Plugin SDK | Plugin lifecycle, agent registration, hooks |
| File System | Read brand XML files from `src/brands/` |

## Configuration

### Build Configuration

- **tsconfig.json** - ES2022 target, ESNext modules, bundler resolution
- **biome.json** - Formatting (spaces, 120 line width, double quotes), linting (recommended rules)

### Environment

No environment variables required. Brand definitions are bundled in `src/brands/`.

## Build & Deploy

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck

# Build (outputs to dist/)
bun run build

# Lint/format
bun run check
bun run format
```

**Build Output:**
- `dist/index.js` - ESM bundle
- `dist/index.d.ts` - TypeScript declarations
- `dist/brands/*.xml` - Bundled brand files

## Adding New Brands

1. Create `src/brands/[name].xml` following the schema
2. Required sections: `meta`, `colors`, `typography`, `spacing`, `radius`
3. Brand is auto-loaded at plugin startup
