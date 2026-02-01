-- CreateEnum
CREATE TYPE "TutorOnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboardingStatus" "TutorOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED';
