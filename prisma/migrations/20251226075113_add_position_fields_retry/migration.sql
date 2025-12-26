-- CreateEnum
CREATE TYPE "IndustrySector" AS ENUM ('Banking', 'Insurance', 'Finance', 'IT', 'Healthcare', 'Consulting', 'Other');

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "applicationInstructions" TEXT,
ADD COLUMN     "contactInfo" JSONB,
ADD COLUMN     "contractDetails" JSONB,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "detailedRequirements" JSONB,
ADD COLUMN     "durationMonths" DOUBLE PRECISION,
ADD COLUMN     "educationRequirements" JSONB,
ADD COLUMN     "industrySector" TEXT,
ADD COLUMN     "languageRequirements" JSONB,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "urgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workArrangement" JSONB;
