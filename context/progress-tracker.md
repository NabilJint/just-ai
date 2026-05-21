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

## In Progress

- Share Dialog: UI implemented and wired to navbar (In Progress)
  - UI: `Share` button added to the editor navbar and opens the `ShareDialog` UI (placeholder list, invite input, copy link with temporary "Copied!" feedback).
  - Next: implement backend APIs to list/invite/remove collaborators and enrich collaborator emails via Clerk Backend API. Enforce owner-only invite/remove server-side.
  - UI: `Share` button added to the editor navbar and opens the `ShareDialog` UI. Dialog now calls new backend APIs to list, invite, and remove collaborators and shows Clerk-enriched names and avatars when available.
  - Server: Added API endpoints at `app/api/projects/[projectId]/collaborators/route.ts` implementing `GET`, `POST`, and `DELETE`. Owner-only checks enforced for invite/remove.
  - Build: Verified `npm run build` succeeds after adding Share Dialog and collaborators API.

## Completed

- `08-editor-workspace-shell.md`: Built `/editor/[roomId]` workspace shell with server-side access checks and layout scaffold. Created `lib/project-access.ts` with helpers to get current user (via Clerk API), check project access (by owner or email-based collaborator), and fetch accessible projects. Implemented `components/editor/access-denied.tsx` with centered lock icon and "Back to Projects" link. Integrated `components/editor/editor-navbar.tsx` and `components/editor/project-sidebar.tsx` into `components/editor/workspace-layout.tsx`, reusing the existing navbar and sidebar. Built central canvas placeholder and a right AI assistant sidebar sized to match the project sidebar. The page at `/editor/[roomId]` enforces auth, shows `AccessDenied` for missing/unauthorized projects, and renders the workspace layout for authorized users. Build passes.

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
