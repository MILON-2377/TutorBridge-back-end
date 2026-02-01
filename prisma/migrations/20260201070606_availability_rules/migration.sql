/*
  Warnings:

  - Changed the type of `dayOfWeek` on the `AvailabilityRule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "AvailabilityRule" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" "WeekDay" NOT NULL;
