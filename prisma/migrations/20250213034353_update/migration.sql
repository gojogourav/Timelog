/*
  Warnings:

  - You are about to drop the column `endTime` on the `TimeLog` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TimeLog` table. All the data in the column will be lost.
  - Added the required column `sessionTime` to the `TimeLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimeLog" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "sessionTime" INTEGER NOT NULL;
