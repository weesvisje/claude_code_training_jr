# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

Use comments sparingly. Only comment complex code.

## Commands

```bash
# Initial setup (install deps + Prisma generate + migrate)
npm run setup

# Development server (Turbopack)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run a single test file
npm test -- src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset database
npm run db:reset
```

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates files into a virtual file system that is previewed live in an iframe.

### Request Flow

1. User sends a message via `ChatContext` (wraps Vercel AI SDK `useChat`)
2. `POST /api/chat` receives messages + serialized virtual FS state
3. The API streams a response from Claude (`claude-haiku-4-5`) using the Vercel AI SDK
4. Claude calls two tools during generation:
   - `str_replace_editor` — create/str_replace/insert operations on files
   - `file_manager` — rename/delete operations
5. Tool calls are forwarded to the client via `onToolCall`, handled by `FileSystemContext`
6. `PreviewFrame` detects FS changes (via `refreshTrigger`) and re-renders the iframe

### Virtual File System

`src/lib/file-system.ts` — `VirtualFileSystem` is a pure in-memory tree structure (no disk I/O). It is serialized as `Record<string, FileNode>` for:
- Sending to the API with each chat request (`fileSystem.serialize()`)
- Persisting to the database (`Project.data` column as JSON string)
- Deserializing back on project load (`deserializeFromNodes`)

### Live Preview

`src/lib/transform/jsx-transformer.ts` handles browser-side preview:
1. Each `.jsx/.tsx` file in the VFS is transpiled via `@babel/standalone`
2. Transpiled code is wrapped in a `Blob` URL
3. An ES module import map is constructed mapping file paths and `@/` aliases to blob URLs
4. Third-party imports (e.g. `lucide-react`) are automatically routed to `esm.sh`
5. Missing local imports get placeholder stub modules
6. A full HTML document with the import map is injected into an `<iframe>` as `srcdoc`
7. Preview uses Tailwind CSS from the CDN (`cdn.tailwindcss.com`)

Entry point detection (in `FileSystemContext`): uses `/App.jsx` if present, otherwise the first root-level `.jsx/.tsx` file. The system prompt instructs Claude to always create `/App.jsx` as the entry point.

### State Management

Two React contexts manage global state:
- `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) — wraps `VirtualFileSystem`, exposes CRUD operations and `handleToolCall` to apply AI tool calls
- `ChatProvider` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat`, passes serialized FS on every request

`src/lib/anon-work-tracker.ts` persists anonymous users' messages and VFS state in `sessionStorage` so work isn't lost before they log in.

### AI Provider

`src/lib/provider.ts` exports `getLanguageModel()`:
- With `ANTHROPIC_API_KEY`: returns `anthropic("claude-haiku-4-5")`
- Without API key: returns `MockLanguageModel` which generates static counter/form/card components through a scripted multi-step flow

### Auth & Persistence

- Auth is JWT-based (`jose`) stored in an `httpOnly` cookie (`src/lib/auth.ts`)
- `server-only` is imported to prevent auth code from leaking to the client
- Anonymous users can generate components but projects are only persisted for authenticated users
- `Project` model stores `messages` (JSON array) and `data` (serialized VFS JSON) as string columns
- Prisma client is generated to `src/generated/prisma` (not `node_modules`)

### Key File Locations

| Path | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Streaming AI endpoint |
| `src/lib/file-system.ts` | VirtualFileSystem class |
| `src/lib/transform/jsx-transformer.ts` | Babel transpile + import map + preview HTML |
| `src/lib/provider.ts` | AI model selection (real vs mock) |
| `src/lib/prompts/generation.tsx` | System prompt sent to Claude |
| `src/lib/tools/str-replace.ts` | `str_replace_editor` tool definition |
| `src/lib/tools/file-manager.ts` | `file_manager` tool definition |
| `src/lib/auth.ts` | JWT session management (server-only) |
| `src/app/main-content.tsx` | Root layout (resizable chat + preview/code panels) |
| `prisma/schema.prisma` | SQLite schema (User, Project) — reference this anytime you need to understand the structure of data in the database |

### Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json`). The jsx-transformer also handles `@/` in generated component imports by mapping them to VFS paths.

### Testing

Tests use Vitest with jsdom and React Testing Library. Test files are colocated in `__tests__/` directories next to the code they test.
