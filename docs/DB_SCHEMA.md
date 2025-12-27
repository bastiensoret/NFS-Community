# Database Schema

## Models

### User
- Identity and Auth.
- Relations: `Company`, `JobPosting` (CreatedPositions).
- Role: String enum (BASIC_USER, USER, ADMIN, SUPER_ADMIN).

### JobPosting
- Core entity.
- **Legacy Fields** (Deprecated/Optional):
  - `workLocation` (Json) - *To be migrated*
  - `externalReference`
- **Current Fields** (Refactored & Flattened):
  - `location` (String)
  - `country` (String)
  - `status` (Enum String)
  - **Work Arrangement**:
    - `remoteAllowed` (Boolean)
    - `onSiteDays` (Int)
  - **Salary**:
    - `minSalary` (Float)
    - `maxSalary` (Float)
    - `currency` (String)
  - **Contact**:
    - `contactName` (String)
    - `contactEmail` (String)
    - `contactPhone` (String)
  - **Arrays** (Postgres):
    - `responsibilities` (String[])
    - `skills` (String[])
    - `languages` (String[]) - *Legacy simple list*
- **Relations**:
  - `languageRequirements` -> `JobPostingLanguage[]`

### JobPostingLanguage
- Relation for detailed language requirements.
- Fields: `language`, `level`, `mandatory`.

### Candidate
- Potential hires.
- `skills`: String array.
- `profileDataJson`: Flexible JSON for extra attributes.

## Design Decisions
- **Normalization**: complex JSON fields (`workArrangement`, `salaryRange`) have been flattened into scalar columns for better SQL querying and type safety.
- **Relations**: `languageRequirements` is now a separate table to allow querying/filtering by language proficiency.
