-- AlterTable
ALTER TABLE "highlights" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;
