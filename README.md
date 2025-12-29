# NFS Community

A modern recruitment management platform built with Next.js, featuring candidate profile management, job posting creation, and role-based access control.

## Features

- **Authentication**: Microsoft Entra ID (Azure AD) SSO + Dev credentials
- **Role-Based Access Control**: Super Administrator, Administrator, Gatekeeper, and User roles
- **Candidate Management**: Create, view, edit, and delete candidate profiles
- **Job Posting Management**: Create and manage job opportunities with detailed information
- **Modern UI**: Built with [shadcn/ui](docs/UI_STANDARDS.md) and Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5 (beta)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
cd nfs-community
npm install
```

### 2. Environment Setup

Update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://nfs_user:nfs_password@localhost:5433/nfs_community?schema=public"

# NextAuth v5 (Auth.js)
AUTH_SECRET="your-secret-key-change-this-in-production"
AUTH_URL="http://localhost:3000"

# Azure AD (Microsoft Entra ID) - Optional
AUTH_MICROSOFT_ENTRA_ID_ID="your-azure-ad-client-id"
AUTH_MICROSOFT_ENTRA_ID_SECRET="your-azure-ad-client-secret"
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID="your-azure-ad-tenant-id"

# Dev Login (Local Only)
AUTH_ENABLE_DEV_LOGIN="true"
```

### 3. Database Setup

We use Docker to run a local PostgreSQL database.

```bash
# Start PostgreSQL container
npm run docker:up

# Or manually:
docker-compose up -d
```

Once the database is running:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with dev user
npx tsx prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the sign-in page.

## Testing

Run the test suite with:

```bash
npm test
```

## Default Credentials

**Dev User (Super Admin)**
- Email: `bastiensoret@gmail.com`
- Password: `devpassword123`
- Role: SUPER_ADMIN

## User Roles

### User
- Visualize job positions
- Post job positions
- Propose candidates

### Administrator
- Visualize all job positions and all candidates with filtering capabilities
- Post job positions and rework/validate job positions from Users
- Add candidates and validate proposed candidates from Users

### Super Administrator
- All Administrator capabilities
- Manage everything regarding the app
- Change other users' roles

### Gatekeeper
- Special capability above their normal role
- Can approve job postings to generate mail campaigns towards matching candidates (feature pending implementation)

## Project Structure

```
nfs-community/
├── app/
│   ├── actions/               # Server Actions (Primary mutations)
│   │   ├── admin.ts
│   │   ├── candidates.ts
│   │   ├── positions.ts
│   │   └── profile.ts
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   └── cron/              # Scheduled tasks
│   ├── auth/                  # Authentication pages (SignIn/SignUp)
│   ├── dashboard/             # Main application
│   │   ├── admin/             # User management
│   │   ├── candidates/        # Candidate management
│   │   ├── gatekeeper/        # Kanban board
│   │   └── positions/         # Job posting management
│   └── page.tsx               # Home (redirects to dashboard)
├── components/
│   ├── dashboard/             # Dashboard-specific components
│   ├── kanban/                # Kanban board components
│   └── ui/                    # shadcn/ui components
├── docs/                      # Technical documentation
├── lib/                       # Shared utilities and configuration
├── prisma/                    # Database schema and migrations
└── types/                     # TypeScript type definitions
```

## Database Schema

### User
- Authentication and authorization
- Roles: SUPER_ADMIN, ADMIN, USER

### Candidate
- Personal information (name, email, phone)
- Desired roles and skills
- Industries and certifications
- Seniority level and location
- JSON profile data storage

### JobPosting
- Job details (title, company, description)
- Location and work arrangement
- Employment type and seniority level
- Responsibilities and objectives
- Skills, education, and experience requirements
- Application details and status

## Available Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Database commands
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate Prisma Client
npx tsx prisma/seed.ts     # Seed database
```

## API & Server Actions

This project has migrated primary data mutations to **Server Actions** for better performance and type safety.

### Server Actions
- **Candidates**: `createCandidateAction`, `updateCandidateAction`, `deleteCandidateAction`
- **Positions**: `createPositionAction`, `updatePositionAction`, `deletePositionAction`, `approvePositionAction`
- **Admin**: `updateUserAction`
- **Profile**: `updateProfile`, `changePassword`, `deleteAccount`

### API Endpoints
- `/api/auth/*`: Authentication endpoints (NextAuth)
- `/api/cron/*`: System maintenance tasks

## Authentication Flow

1. User visits the application
2. Redirected to `/auth/signin`
3. Choose authentication method:
   - Microsoft SSO (Azure AD)
   - Dev credentials (email/password)
4. On success, redirected to `/dashboard`
5. Middleware protects all routes except auth pages

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Check database exists: `createdb nfs_community`

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check Azure AD credentials if using SSO
- Clear browser cookies and try again

### TypeScript Errors
- Run `npx prisma generate` to regenerate types
- Restart TypeScript server in your IDE

## Future Enhancements

- Candidate-Job matching algorithm
- Email notifications
- Advanced search and filtering
- Document upload and management
- Activity logs and audit trail
- Export functionality (PDF, CSV)

## License

MIT
