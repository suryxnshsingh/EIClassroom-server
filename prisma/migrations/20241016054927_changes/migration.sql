/*
  Warnings:

  - The primary key for the `Sheet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StudentToSubject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StudentToSubject" DROP CONSTRAINT "_StudentToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentToSubject" DROP CONSTRAINT "_StudentToSubject_B_fkey";

-- AlterTable
ALTER TABLE "Sheet" DROP CONSTRAINT "Sheet_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "MST1" DROP NOT NULL,
ALTER COLUMN "MST2" DROP NOT NULL,
ALTER COLUMN "Quiz_Assignment" DROP NOT NULL,
ALTER COLUMN "EndSem" DROP NOT NULL,
ADD CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id", "subjectCode");
DROP SEQUENCE "Sheet_id_seq";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "_StudentToSubject";
