# Database Schema

## Models

### User
- Identity and Auth (NextAuth integration).
- Relations: `Company`, `JobPosting` (CreatedPositions), `Candidate` (CreatedCandidates).
- Role: String (`USER`, `ADMIN`, `SUPER_ADMIN`).
- Fields: `email`, `password`, `isGatekeeper`, `tenantId`, `firstName`, `lastName`, `plan`, etc.

### JobPosting
- Core recruitment entity.
- **Core Fields**: `jobTitle`, `companyName`, `location`, `country`, `status`.
- **Details**: `description`, `industrySector`, `seniorityLevel`, `employmentType`, `durationMonths`, `startDate`, `endDate`.
- **Work Arrangement**: `remoteAllowed` (Boolean), `onSiteDays` (Int).
- **Salary**: `minSalary`, `maxSalary`, `currency`.
- **Arrays**: `responsibilities`, `skills`, `objectives`, `education`, `experience`.
- **Relations**: `languageRequirements` (one-to-many), `creator` (belongs-to).

### Candidate
- Potential hire profiles.
- **Fields**: `firstName`, `lastName`, `email`, `phoneNumber`, `seniorityLevel`, `location`, `status`.
- **Arrays**: `desiredRoles`, `skills`, `industries`, `certifications`, `languages`.
- **JSON**: `profileDataJson` for extensible data storage.

### Infrastructure Models
- **Account / Session / VerificationToken**: Standard Auth.js models.
- **Company**: Multi-tenant support fields.
- **RateLimit**: API protection and request throttling.
- **JobPostingLanguage**: Structured language requirements for positions.

## Design Decisions
- **Normalization**: complex JSON fields (`workArrangement`, `salaryRange`) have been flattened into scalar columns for better SQL querying and type safety.
- **Relations**: `languageRequirements` is now a separate table to allow querying/filtering by language proficiency.
