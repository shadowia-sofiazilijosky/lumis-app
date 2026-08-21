-- CreateEnum
CREATE TYPE "FontPreference" AS ENUM ('LORA', 'PLAYFAIR_DISPLAY', 'INTER', 'CAVEAT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "font_preference" "FontPreference" NOT NULL DEFAULT 'LORA';
