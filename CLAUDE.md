# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Tauri desktop application** for managing customer accounts and project credentials. It combines a Vue 3 frontend with a Rust backend to create a native desktop app with a small binary size and native performance.

**Core functionality:**
- Customer management (CRUD operations)
- Project management per customer
- Account/credential management with URLs, usernames, passwords
- Local data persistence using localStorage
- Three-panel layout UI (Customers → Projects → Accounts)

## Development Commands

### Frontend Development
```bash
# Install dependencies
pnpm install

# Start Vite dev server (frontend only)
pnpm dev
# Runs on http://localhost:1420 (fixed port, will fail if unavailable)

# Type check + build frontend for production
pnpm build
# Runs vue-tsc type checking first, then Vite build to /dist

# Preview production build
pnpm preview
```

### Full Tauri Development
```bash
# Start Tauri development mode (frontend + Rust backend)
pnpm tauri
# Equivalent to: tauri dev
# This will:
#   1. Run "pnpm dev" to start Vite dev server
#   2. Compile and run the Rust backend
#   3. Open the desktop application window

# Build the complete desktop application
pnpm tauri build
# This will:
#   1. Run "pnpm build" to create production frontend
#   2. Compile Rust backend with release optimizations
#   3. Bundle the final desktop app for the current platform
```

### Rust Backend Development
```bash
# From src-tauri/ directory
cargo build              # Compile Rust backend (debug)
cargo build --release    # Compile Rust backend (release)
cargo test               # Run Rust tests
cargo clippy             # Lint Rust code
```

## Architecture

### Frontend Architecture (Vue 3 + TypeScript)

**State Management:**
- Centralized state in `src/App.vue` using Vue 3 Composition API
- No external state management library (Vuex/Pinia)
- Unidirectional data flow: props down, events up
- All state changes trigger auto-save to localStorage

**Component Structure:**
```
App.vue (root component)
├── CustomerManager.vue (20% width)
│   └── Lists and manages customers
├── ProjectManager.vue (20% width)
│   └── Lists and manages projects for selected customer
└── AccountManager.vue (60% width)
    └── Manages account credentials for selected project
```

**Data Persistence:**
- Storage utility: `src/utils/storage.ts`
- Storage key: `account_management_data`
- Auto-saves on any CRUD operation
- Data structure defined in `src/types/index.ts`

**UI Library:**
- Element Plus (Vue 3 component library)
- Icons from `@element-plus/icons-vue`
- Three-panel flexbox layout (20%-20%-60%)

### Backend Architecture (Rust + Tauri)

**Tauri Command Pattern:**
- Commands defined in `src-tauri/src/lib.rs` with `#[tauri::command]`
- Commands registered in `invoke_handler` within `lib.rs`
- Currently minimal: only has example `greet` command
- Backend can be extended to add secure credential storage, file operations, etc.

**Library Structure:**
- Library name: `account_lib` (defined in Cargo.toml)
- Crate types: staticlib, cdylib, rlib
- Entry point: `src-tauri/src/main.rs`

**Dependencies:**
- `tauri` v2 - Core Tauri framework
- `tauri-plugin-opener` v2 - For opening URLs/files
- `serde` v1 - Serialization/deserialization
- `serde_json` v1 - JSON handling

### Build Configuration

**Vite Configuration (`vite.config.ts`):**
- Fixed port: 1420 with `strictPort: true`
- HMR port: 1421
- Ignores `src-tauri` directory during file watching
- `clearScreen: false` to preserve Rust error messages
- Environment variable `TAURI_DEV_HOST` for remote development

**Tauri Configuration (`src-tauri/tauri.conf.json`):**
- Dev URL: `http://localhost:1420`
- Before dev command: `pnpm dev`
- Before build command: `pnpm build`
- Frontend dist: `../dist`
- Window: 800x600 pixels
- App identifier: `com.zhanghaoran.account`

**Package Manager:**
- Uses `pnpm` (not npm or yarn)
- Lock file: `pnpm-lock.yaml`

## Data Flow

1. User interaction with UI component
2. Component emits event to parent (`App.vue`)
3. Parent updates reactive state
4. Parent calls `saveData()` from `src/utils/storage.ts`
5. State changes flow down to child components via props
6. UI updates reactively

## IDE Setup

**Recommended VS Code Extensions:**
- `Vue.volar` - Vue language support
- `tauri-apps.tauri-vscode` - Tauri support
- `rust-lang.rust-analyzer` - Rust language support

**TypeScript Configuration:**
- Strict mode enabled
- Target: ES2020
- Module: ESNext
- JSX: preserve (for Vue SFCs)

## Key Files to Understand

- `src/App.vue` - Root component with centralized state
- `src/types/index.ts` - TypeScript interfaces
- `src/utils/storage.ts` - localStorage persistence
- `src-tauri/src/lib.rs` - Tauri commands
- `vite.config.ts` - Vite build configuration
- `src-tauri/tauri.conf.json` - Tauri app configuration

## Development Notes

- The Vite dev server runs on port 1420 and uses `strictPort: true` - the port must be available
- When running `pnpm tauri dev`, both the Vite dev server and Rust backend are started
- The app uses localStorage for data persistence (not secure for production credential storage)
- No testing framework is currently configured
- The Rust backend has minimal functionality - most logic is in the Vue frontend
- Tauri allows calling Rust commands from the frontend using `invoke()` from `@tauri-apps/api`
