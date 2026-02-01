/*
  Warnings:

  - A unique constraint covering the columns `[availabilityRuleId,date,startTime,endTime]` on the table `AvailabilitySlot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AvailabilitySlot_date_startTime_endTime_key";

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_availabilityRuleId_date_startTime_endTime_key" ON "AvailabilitySlot"("availabilityRuleId", "date", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
