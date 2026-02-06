/*
  Warnings:

  - You are about to drop the column `endTime` on the `AvailabilityRule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `AvailabilityRule` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `AvailabilitySlot` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `AvailabilitySlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[availabilityRuleId,date,startMinute]` on the table `AvailabilitySlot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endMinute` to the `AvailabilityRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startMinute` to the `AvailabilityRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endMinute` to the `AvailabilitySlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startMinute` to the `AvailabilitySlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AvailabilitySlot_availabilityRuleId_date_startTime_key";

-- AlterTable
ALTER TABLE "AvailabilityRule" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "endMinute" INTEGER NOT NULL,
ADD COLUMN     "startMinute" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AvailabilitySlot" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "endMinute" INTEGER NOT NULL,
ADD COLUMN     "startMinute" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_availabilityRuleId_date_startMinute_key" ON "AvailabilitySlot"("availabilityRuleId", "date", "startMinute");
