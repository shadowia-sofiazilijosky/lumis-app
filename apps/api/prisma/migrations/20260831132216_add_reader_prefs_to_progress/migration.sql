-- AlterTable
ALTER TABLE "reading_progress" ADD COLUMN     "page_turn_mode" TEXT NOT NULL DEFAULT 'flip',
ADD COLUMN     "reading_ruler_enabled" BOOLEAN NOT NULL DEFAULT false;
