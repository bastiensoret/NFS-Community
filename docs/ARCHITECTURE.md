# Project Architecture

## Overview
NFS Community is a recruitment and candidate management platform built with Next.js.

## Tech Stack
- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Auth.js (NextAuth) v5
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI) - See [UI Standards](docs/UI_STANDARDS.md) for usage guidelines.
- **Testing**: Vitest

## Documentation Policy
Always adhere to the documentation rules:
1. **Read documentation first** before making any changes.
2. **Update documentation after each change** to reflect new behavior, UI standards, or API updates.

## Key Concepts

### Role-Based Access Control (RBAC)
- **Roles**: defined in `lib/roles.ts` (BASIC_USER, USER, ADMIN, SUPER_ADMIN).
- **Permissions**: Granular flags (e.g., `canPostPositions`).
- **Enforcement**:
  - API Level: `withAuth` HOC in `lib/api-utils.ts`.
  - UI Level: `hasPermission` helper.

### Job Position Workflow
1. **Draft**: Created by Users. Visible only to creator and Super Admin.
2. **Pending Approval**: Submitted by User. Visible to Admins.
3. **Active/Campaign Sent**: Approved by Gatekeeper/Admin. Publicly visible.
4. **Archived**: Closed positions.

### Data Flow
- **Mutations**: Primary migration to Server Actions (`app/actions/`) for Candidates, Positions, and Profile management. Some legacy API routes remain for specific integrations.
- **Fetching**: Server Components (direct DB access) for initial page loads and search results. Client Components handle local state and optimistic updates.

## Directory Structure
- `app/`: Next.js App Router pages and API routes.
- `components/`: React components (UI and Feature-specific).
- `lib/`: Utilities, Prisma client, Zod schemas, Auth config.
- `prisma/`: Database schema and seeds.
- `__tests__`: Integration and Unit tests.
