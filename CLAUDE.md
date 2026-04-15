# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tauri v2 desktop app for managing customer accounts and project credentials. Vue 3 + TypeScript frontend, Rust backend. Three-panel layout: Customers (dark sidebar) → Projects (white middle panel) → Accounts (light gray main area).

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Vite dev server on http://localhost:1420 (strictPort, will fail if port busy)
pnpm build            # vue-tsc --noEmit && vite build → /dist
pnpm tauri            # tauri dev (starts Vite + Rust backend, opens desktop window)
pnpm tauri build      # Production build of the complete desktop app

# Rust (from src-tauri/)
cargo build           # Compile Rust backend
cargo test            # Run Rust tests
cargo clippy          # Lint Rust code
```

## Architecture

### State Management

Centralized in `src/App.vue` via Vue 3 Composition API. No Pinia/Vuex. All reactive state (`customers`, `projects`, `accounts`) auto-saves to localStorage through a `watch()` with `{ deep: true }`. Data flow: props down, events up.

### Data Model (`src/types/index.ts`)

- `customers: string[]` — customer names
- `projects: Record<string, string[]>` — maps customer name to list of project names
- `accounts: ProjectInfo[]` — flat array of all account records, each with `customerName` + `projectName` as the foreign key

### Component Hierarchy

```
App.vue — owns all state, handles CRUD
├── CustomerManager.vue (w-72, dark bg #1d1d1f)
├── ProjectManager.vue (w-72, white bg)
└── AccountManager.vue (flex-1, #f5f5f7 bg)
```

Common reusable components live in `src/components/common/`: `ListItem`, `InputDialog`, `ConfirmDialog`, `MessageToast`, `PanelHeader`.

### Styling — Apple Design System (`design.md`)

The UI follows an Apple-inspired design system documented in `design.md`. Key rules:

- **Single accent color**: Apple Blue `#0071e3` — only used for interactive elements
- **No borders on cards/containers** — elevation comes from background color contrast or soft shadows only
- **Dark/light binary**: `#1d1d1f` (dark) vs `#f5f5f7` (light gray) backgrounds
- **Typography**: SF Pro Text (body, <20px) / SF Pro Display (headings, ≥20px), negative letter-spacing at all sizes
- **Buttons**: `.apple-btn` (primary blue), `.apple-btn-default` (outlined), `.apple-btn-danger` (red), `.apple-btn-secondary` (dark) — all 8px border-radius
- **Inputs**: `.apple-input` — `#fafafc` background, Apple Blue focus ring
- **Shadows**: Only `shadow-apple-card` (`rgba(0,0,0,0.22) 3px 5px 30px`) for elevated cards, or none
- **CSS classes**: Prefix is `apple-` not `ant-` (e.g., `apple-fade`, `apple-zoom`, `apple-slide-up` transitions)
- **Tailwind**: Custom colors via `apple-*` prefix (e.g., `bg-apple-blue`, `text-apple-near-black`, `rounded-apple`)

### Rust Backend (`src-tauri/`)

Minimal — only an example `greet` command. Tauri commands defined in `src-tauri/src/lib.rs` with `#[tauri::command]`, registered in `invoke_handler`. Can be extended for secure credential storage or file operations.

## Key Conventions

- **Package manager**: pnpm only
- **TypeScript**: strict mode, `noUnusedLocals` and `noUnusedParameters` enabled — unused imports will fail `pnpm build`
- **Vite port**: 1420 with `strictPort: true` — must be available
- **Tauri config**: Window 800×600, identifier `com.zhanghaoran.account`
