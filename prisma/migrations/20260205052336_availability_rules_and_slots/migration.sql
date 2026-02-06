/*
  Warnings:

  - A unique constraint covering the columns `[availabilityRuleId,date,startTime]` on the table `AvailabilitySlot` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `startTime` on the `AvailabilityRule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `AvailabilityRule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `startTime` on the `AvailabilitySlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endTime` on the `AvailabilitySlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "AvailabilitySlot_availabilityRuleId_date_startTime_endTime_key";

-- AlterTable
ALTER TABLE "AvailabilityRule" DROP COLUMN "startTime",
ADD COLUMN     "startTime" INTEGER NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AvailabilitySlot" DROP COLUMN "startTime",
ADD COLUMN     "startTime" INTEGER NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_availabilityRuleId_date_startTime_key" ON "AvailabilitySlot"("availabilityRuleId", "date", "startTime");
