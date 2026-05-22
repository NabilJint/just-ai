# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 3: Collaborative Canvas Integration (In Progress)

## Current Goal

- Establish the collaborative canvas component framework with dynamic node mapping, custom cursor synchronization, and canvas persistence.

## Completed

- `01-design-system.md`: Installed and configured `shadcn/ui`, added components (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea) with `@base-ui/react` support under Tailwind CSS v4, created `lib/utils.ts` with `cn()` and theme preference configurations, and integrated full dark-theme variables in `globals.css`.
- `02.editor.md`: Created and stitched `components/editor/editor-navbar.tsx` and `components/editor/project-sidebar.tsx` inside the `/editor` page workspace with reactive toggle states, smooth backdrop closing, and tab layouts.
- `03-auth.md`: Integrated Clerk Authentication across the entire codebase. Configured root layout with `<ClerkProvider>` overriding variables using dark system CSS variables, built custom responsive `/sign-in` and `/sign-up` split-panel interfaces, protected all routes by default using Next.js 16's root `proxy.ts` middleware, and wired `<UserButton />` into the editor header.
- `Logo, Favicon & Authentication Fixes`: Re-generated a modern, high-quality neon-green and cyan glowing ghost mascot logo using AI, and deployed it as the app icon and favicon. Fixed a runtime `TypeError` in Next.js 16 `proxy.ts` middleware by correcting `await auth.protect()` to secure the `/editor` page against unauthenticated access. Integrated `afterSignOutUrl="/sign-in"` in `ClerkProvider` ([app/layout.tsx]) to guarantee an instant redirection to `/sign-in` upon logging out.
- `05-prisma.md`: Defined data models for `Project` and `ProjectCollaborator` with corresponding relations, cascade delete behavior, and database indexes. Configured `prisma/models/project.prisma`. Implemented `lib/prisma.ts` cached client singleton that correctly branches between Prisma Accelerate and direct `@prisma/adapter-pg` depending on the `DATABASE_URL`. Confirmed migration is active, generated client, and built successfully.
- `06-project-apis.md`: Built REST API routes for project CRUD — `GET /api/projects` (list), `POST /api/projects` (create with default name), `PATCH /api/projects/[projectId]` (rename), and `DELETE /api/projects/[projectId]`. All routes enforce Clerk auth (`401` for unauthenticated), owner-only access on mutations (`403` for non-owners), and `404` for missing projects. Installed missing `@prisma/client-runtime-utils` dependency to fix Turbopack build. Build passes.
- `07-wire-editor-home.md`: Wired the editor home sidebar and dialogs to the real project API. Created `hooks/use-project-actions.tsx` hook to manage dialog state (create, rename, delete) and project mutations. Created server-side data helper `lib/project-helpers.ts` to fetch owned and shared projects. Converted editor page to server component that passes project data to client component. Wired sidebar and all dialogs to use the new hook with real API calls. Create action navigates to new workspace, rename and delete refresh on success. `npm run build` passes.
- `08-editor-workspace-shell.md`: Built `/editor/[roomId]` workspace shell with server-side access checks and layout scaffold. Created `lib/project-access.ts` with helpers to get current user (via Clerk API), check project access (by owner or email-based collaborator), and fetch accessible projects. Implemented `components/editor/access-denied.tsx` with centered lock icon and "Back to Projects" link. Integrated `components/editor/editor-navbar.tsx` and `components/editor/project-sidebar.tsx` into `components/editor/workspace-layout.tsx`, reusing the existing navbar and sidebar. Built central canvas placeholder and a right AI assistant sidebar sized to match the project sidebar. The page at `/editor/[roomId]` enforces auth, shows `AccessDenied` for missing/unauthorized projects, and renders the workspace layout for authorized users. Build passes.
- Extracted the right AI assistant panel into `components/editor/ai-assistant-sidebar.tsx` and composed it from `components/editor/workspace-layout.tsx`.
- **Sidebar & Layout Polish**: Refactored the Project and AI Assistant sidebars to float seamlessly over the canvas (by removing push margin classes from `<main>`), allowing the dotted canvas background to render edge-to-edge. Elevated the sidebars with semi-transparent, blurred backgrounds (`bg-card/90 backdrop-blur-md`) and `shadow-2xl`. Fixed left sidebar hiding completely by transitioning opacity along with transform, preventing shadow bleeding and blocking mouse clicks when toggled off.

- `10-liveblocks-setup.md`: Set up Liveblocks Presence/UserMeta typing, added the cached node client with deterministic cursor colors, and created `POST /api/liveblocks-auth` with Clerk auth, project access checks, room creation, and metadata-bearing session tokens. Validation in progress.

- `11-base-canvas.md`: Implementing the Liveblocks-backed React Flow canvas (client-side wrapper, shared types, and wiring). Initial scaffolding added: `types/canvas.ts`, `components/editor/ClientCanvas.tsx`, and the `/editor/[roomId]` page now renders the client canvas. Build validation passes.

- `12-shape-panel.md`: Added bottom shape panel for drag-and-drop node creation. Implemented `components/editor/ShapePanel.tsx`, `lib/node-id.ts`, updated `components/editor/ClientCanvas.tsx` to handle dragover/drop with React Flow 12 `screenToFlowPosition`, create shape-typed nodes on drop, and render shape-specific rectangle, diamond, circle, pill, cylinder, and hexagon nodes. Fixed the minimap colors and infinite-canvas background. `npm run build` passes.
- `14-node-editing.md`: Integrated `@xyflow/react` `NodeResizer` inside canvas nodes with custom subtle dark-themed handle/line styles and shape-specific minimum dimensions (60px for circles, 80x40px for others). Implemented double-click inline label editing using an absolutely overlayed `<textarea>` styled exactly like the static text to avoid layout shifts. Built seamless cooperative state sync using `useReactFlow().setNodes` and excluded text interactions from triggering canvas drag or panning utilizing the `nodrag nopan` React Flow helper classes. `npm run build` successfully compiles and passes all checks.

## In Progress

- none currently

## Next Up

- Phase 3: Collaborative Canvas Integration (Scaffolding and socket integrations)

## Session Notes

- Started Share Dialog implementation planning (see [context/feature-specs/09-share-dialog.md](context/feature-specs/09-share-dialog.md)).
- TODOs created and first task (Add Share button to editor navbar) marked in-progress.
- Implemented `Share` button and added initial `ShareDialog` UI component. (See [components/editor/workspace-layout.tsx](components/editor/workspace-layout.tsx#L1) and [components/editor/dialogs/ShareDialog.tsx](components/editor/dialogs/ShareDialog.tsx#L1)).
- Updated todo list: Share button completed, ShareDialog UI in-progress.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Add context needed to resume work in the next session.
