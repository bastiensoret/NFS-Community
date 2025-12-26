/*
  Warnings:

  - The `desiredRoles` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skills` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `industries` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `certifications` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `profileDataJson` column on the `Candidate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `responsibilities` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `objectives` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `education` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `experience` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `skills` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `languages` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `salaryRange` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contactPerson` column on the `JobPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `workLocation` on the `JobPosting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "desiredRoles",
ADD COLUMN     "desiredRoles" TEXT[],
DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[],
DROP COLUMN "industries",
ADD COLUMN     "industries" TEXT[],
DROP COLUMN "certifications",
ADD COLUMN     "certifications" TEXT[],
DROP COLUMN "profileDataJson",
ADD COLUMN     "profileDataJson" JSONB;

-- AlterTable
ALTER TABLE "JobPosting" DROP COLUMN "workLocation",
ADD COLUMN     "workLocation" JSONB NOT NULL,
DROP COLUMN "responsibilities",
ADD COLUMN     "responsibilities" TEXT[],
DROP COLUMN "objectives",
ADD COLUMN     "objectives" TEXT[],
DROP COLUMN "education",
ADD COLUMN     "education" TEXT[],
DROP COLUMN "experience",
ADD COLUMN     "experience" TEXT[],
DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[],
DROP COLUMN "languages",
ADD COLUMN     "languages" TEXT[],
DROP COLUMN "salaryRange",
ADD COLUMN     "salaryRange" JSONB,
DROP COLUMN "contactPerson",
ADD COLUMN     "contactPerson" JSONB;
