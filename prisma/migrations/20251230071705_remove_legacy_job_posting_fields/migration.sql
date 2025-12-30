/*
  Warnings:

  - You are about to drop the column `profileDataJson` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `applicationCount` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `applicationDeadline` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `applicationInstructions` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `applicationMethod` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `companyDivision` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `contactInfo` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `contactPerson` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `contractDetails` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `contractDuration` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `detailedRequirements` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `educationRequirements` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `externalReference` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `languageRequirements` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `missionContext` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `organizationalUnit` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `postingDate` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `roleCategory` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `roleProfile` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `salaryRange` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `travelRequired` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `urgent` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `workArrangement` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `workLocation` on the `JobPosting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reference]` on the table `JobPosting` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phoneNumber` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `seniorityLevel` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `JobPosting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `JobPosting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "profileDataJson",
DROP COLUMN "skills",
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "education" TEXT[],
ADD COLUMN     "educationLevel" TEXT,
ADD COLUMN     "hardSkills" TEXT[],
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "previousRoles" TEXT[],
ADD COLUMN     "softSkills" TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "phoneNumber" SET NOT NULL,
ALTER COLUMN "seniorityLevel" SET NOT NULL;

-- AlterTable
ALTER TABLE "JobPosting" DROP COLUMN "applicationCount",
DROP COLUMN "applicationDeadline",
DROP COLUMN "applicationInstructions",
DROP COLUMN "applicationMethod",
DROP COLUMN "companyDivision",
DROP COLUMN "contactInfo",
DROP COLUMN "contactPerson",
DROP COLUMN "contractDetails",
DROP COLUMN "contractDuration",
DROP COLUMN "department",
DROP COLUMN "detailedRequirements",
DROP COLUMN "domain",
DROP COLUMN "educationRequirements",
DROP COLUMN "externalReference",
DROP COLUMN "industry",
DROP COLUMN "languageRequirements",
DROP COLUMN "languages",
DROP COLUMN "lastUpdated",
DROP COLUMN "missionContext",
DROP COLUMN "organizationalUnit",
DROP COLUMN "postingDate",
DROP COLUMN "roleCategory",
DROP COLUMN "roleProfile",
DROP COLUMN "salaryRange",
DROP COLUMN "source",
DROP COLUMN "sourceUrl",
DROP COLUMN "travelRequired",
DROP COLUMN "urgent",
DROP COLUMN "viewCount",
DROP COLUMN "workArrangement",
DROP COLUMN "workLocation",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'EUR',
ADD COLUMN     "maxSalary" DOUBLE PRECISION,
ADD COLUMN     "minSalary" DOUBLE PRECISION,
ADD COLUMN     "onSiteDays" INTEGER,
ADD COLUMN     "remoteAllowed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "employmentType" SET DEFAULT 'CONTRACT',
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- CreateTable
CREATE TABLE "JobPostingLanguage" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobPostingLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "identifier" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("identifier")
);

-- CreateIndex
CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_reference_key" ON "JobPosting"("reference");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPostingLanguage" ADD CONSTRAINT "JobPostingLanguage_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
