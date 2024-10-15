/*
  Warnings:

  - You are about to drop the column `COs` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `POs` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `marks` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_subjectCode_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "COs",
DROP COLUMN "POs",
DROP COLUMN "marks",
DROP COLUMN "subjectCode";

-- CreateTable
CREATE TABLE "Sheet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "MST1" INTEGER NOT NULL,
    "MST2" INTEGER NOT NULL,
    "Quiz_Assignment" INTEGER NOT NULL,
    "EndSem" INTEGER NOT NULL,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentToSubject" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StudentToSubject_AB_unique" ON "_StudentToSubject"("A", "B");

-- CreateIndex
CREATE INDEX "_StudentToSubject_B_index" ON "_StudentToSubject"("B");

-- AddForeignKey
ALTER TABLE "Sheet" ADD CONSTRAINT "Sheet_subjectCode_fkey" FOREIGN KEY ("subjectCode") REFERENCES "Subject"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sheet" ADD CONSTRAINT "Sheet_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToSubject" ADD CONSTRAINT "_StudentToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToSubject" ADD CONSTRAINT "_StudentToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("code") ON DELETE CASCADE ON UPDATE CASCADE;
