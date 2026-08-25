/*
  Warnings:

  - The `color` column on the `highlights` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "highlights" DROP COLUMN "color",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#F5D76EAA';

-- DropEnum
DROP TYPE "HighlightColor";
