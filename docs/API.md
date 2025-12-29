# API Documentation

## Authentication
All protected endpoints require a valid session via NextAuth.
Headers: `Cookie: authjs.session-token=...`

## Endpoints

### Positions

#### `GET /api/positions`
Retrieve a paginated list of job positions.
- **Query Params**:
  - `page`: number (default 1)
  - `limit`: number (default 10)
  - `status`: Filter by status (ACTIVE, DRAFT, etc.)
  - `cursor`: ID of the last item for cursor-based pagination.
- **Response**: `{ data: Position[], meta: { total, page, limit, totalPages, nextCursor } }`

#### `POST /api/positions`
Create a new job position.
- **Body**: `JobPostingInput` (see Zod Schema in `lib/validations.ts`).
  - Supports flattened fields: `remoteAllowed`, `onSiteDays`, `minSalary`, etc.
  - `languageRequirements` array maps to relation.
- **Permissions**: 
  - `BASIC_USER` -> forces status `DRAFT`.
  - `ADMIN` -> can set any status.

#### `PATCH /api/positions/[id]`
Update an existing position.
- **Body**: Partial `JobPostingInput`.
- **Permissions**:
  - Creator can edit if `DRAFT`.
  - Admin can edit any.
  - Gatekeeper can approve (`PENDING_APPROVAL` -> `CAMPAIGN_SENT`).

#### `DELETE /api/positions/[id]`
Delete a position.
- **Permissions**: Creator or Admin.

### Candidates

Candidate management has been fully migrated to Server Actions. Legacy API endpoints have been removed.

#### Actions (Internal)
- `createCandidateAction(data: CandidateInput)`: Create a new candidate profile.
- `updateCandidateAction(id: string, data: CandidateInput)`: Update an existing candidate.
- `deleteCandidateAction(id: string)`: Delete a candidate profile.

### Positions

Position management uses a mix of Server Actions and API routes.

#### Actions (Internal)
- `createPositionAction(data: JobPostingInput)`: Create a new job position.
- `updatePositionAction(id: string, data: JobPostingInput)`: Update an existing position.
- `deletePositionAction(id: string)`: Delete a position.
- `approvePositionAction(id: string)`: Approve a pending position.

## Error Handling
Standard HTTP codes:
- 200/201: Success
- 400: Validation Error (Zod details in body)
- 401: Unauthorized (Not logged in)
- 403: Forbidden (Insufficient permissions)
- 404: Not Found
- 500: Internal Server Error
