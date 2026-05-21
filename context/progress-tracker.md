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

- Phase 3: Initial canvas scaffolding and socket integrations.

## Next Up

- Feature 08 (TBD)

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

## Session Notes

- Add context needed to resume work in the next session.
