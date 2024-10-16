/*
  Warnings:

  - The primary key for the `Sheet` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Sheet" DROP CONSTRAINT "Sheet_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id", "subjectCode");
