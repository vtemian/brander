# Reskin Architecture

## Overview

Reskin is an OpenCode plugin that analyzes web projects and generates skin transformation plans. It reads skin definitions from XML files and uses AI agents to analyze a project's current styling (CSS, Tailwind, components), then outputs an actionable checklist to match the target skin.

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
reskin/
├── src/
│   ├── index.ts              # Plugin entry point, registers agents/commands/hooks
│   ├── agents/               # AI agent configurations
│   │   ├── index.ts          # Agent registry and exports
│   │   ├── reskin.ts        # Primary orchestrator agent
│   │   ├── style-analyzer.ts # CSS/Tailwind analysis subagent
│   │   └── component-scanner.ts # UI component analysis subagent
│   ├── skins/               # Skin definition system
│   │   ├── index.ts          # Skin loader (loadSkins, getSkin, listSkins)
│   │   ├── schema.ts         # TypeScript type definitions
│   │   ├── parser.ts         # Custom XML parser (regex-based, no deps)
│   │   └── nof1.xml          # Bundled skin definition
│   └── hooks/
│       └── skin-injector.ts # Injects skin XML into agent prompts
├── tests/                    # Test files (mirrors src/ structure)
│   ├── agents/
│   ├── skins/
│   ├── index.test.ts
│   ├── integration.test.ts
│   └── skin-injection.test.ts
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
1. Load all skin XML files at startup via `loadSkins()`
2. Create skin injector hook
3. Return config callback that registers:
   - All agents from `src/agents/`
   - `/skin` command with template
   - `chat.message` and `chat.params` hooks

### 2. Skins Module (`src/skins/`)

**Responsibility:** Load, parse, and store skin definitions.

| File | Purpose |
|------|---------|
| `index.ts` | Skin storage (two Maps) and public API |
| `schema.ts` | TypeScript interfaces for skin structure |
| `parser.ts` | Custom XML parser using regex |
| `*.xml` | Skin definition files |

**Key Functions:**
- `loadSkins()` - Reads all `.xml` files from skins directory
- `getSkin(name)` - Returns parsed `Skin` object
- `getSkinXml(name)` - Returns raw XML string
- `listSkins()` - Returns array of loaded skin names

**Skin Schema (required sections):**
- `meta` - description, target (web/mobile/all)
- `colors` - palette and semantic colors
- `typography` - fonts and scale
- `spacing` - base unit
- `radius` - border radius sizes

**Optional sections:** `components`, `voice`, `guidelines`

### 3. Agents Module (`src/agents/`)

**Responsibility:** Define AI agent configurations for skin analysis.

| Agent | Mode | Purpose |
|-------|------|---------|
| `reskin` | primary | Orchestrates analysis, spawns subagents, generates plan |
| `style-analyzer` | subagent | Analyzes CSS, Tailwind, design tokens |
| `component-scanner` | subagent | Scans UI components, identifies patterns |

**Agent Workflow:**
1. User invokes `/skin [name]`
2. `reskin` agent spawns `style-analyzer` and `component-scanner` in parallel
3. Subagents return findings
4. `reskin` compares findings against skin definition
5. Outputs transformation checklist

### 4. Hooks Module (`src/hooks/`)

**Responsibility:** Intercept chat messages and inject skin context.

**Skin Injector Hook:**
- `chat.message` - Extracts skin name from `/skin [name]` command
- `chat.params` - Replaces `$SKIN_XML` placeholder in agent prompts with actual XML

**State:** Uses a Map to track skin requests per session (cleaned up after injection).

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User: /skin nof1                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  chat.message hook                                                      │
│  - Extracts "nof1" from command                                         │
│  - Stores in skinRequests Map                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  chat.params hook                                                       │
│  - Retrieves skin XML via getSkinXml("nof1")                          │
│  - Replaces $SKIN_XML in reskin agent prompt                          │
│  - Clears session state                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  reskin agent (primary)                                                │
│  - Has skin XML in system prompt                                       │
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
│  reskin agent                                                          │
│  - Compares findings vs skin definition                                │
│  - Generates transformation plan                                        │
│  - Outputs actionable checklist                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## External Integrations

| Integration | Purpose |
|-------------|---------|
| OpenCode Plugin SDK | Plugin lifecycle, agent registration, hooks |
| File System | Read skin XML files from `src/skins/` |

## Configuration

### Build Configuration

- **tsconfig.json** - ES2022 target, ESNext modules, bundler resolution
- **biome.json** - Formatting (spaces, 120 line width, double quotes), linting (recommended rules)

### Environment

No environment variables required. Skin definitions are bundled in `src/skins/`.

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
- `dist/skins/*.xml` - Bundled skin files

## Adding New Skins

1. Create `src/skins/[name].xml` following the schema
2. Required sections: `meta`, `colors`, `typography`, `spacing`, `radius`
3. Skin is auto-loaded at plugin startup
