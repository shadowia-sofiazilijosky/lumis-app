/*
  Warnings:

  - You are about to drop the column `cover_image_url` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `original_file_url` on the `books` table. All the data in the column will be lost.
  - Added the required column `original_file_key` to the `books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "cover_image_url",
DROP COLUMN "original_file_url",
ADD COLUMN     "cover_image_key" TEXT,
ADD COLUMN     "original_file_key" TEXT NOT NULL;
