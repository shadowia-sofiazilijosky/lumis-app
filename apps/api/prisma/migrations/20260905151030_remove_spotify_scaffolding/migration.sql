/*
  Warnings:

  - You are about to drop the column `spotify_playlist_id` on the `shelves` table. All the data in the column will be lost.
  - You are about to drop the column `spotify_playlist_url` on the `shelves` table. All the data in the column will be lost.
  - You are about to drop the `spotify_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "spotify_accounts" DROP CONSTRAINT "spotify_accounts_user_id_fkey";

-- AlterTable
ALTER TABLE "shelves" DROP COLUMN "spotify_playlist_id",
DROP COLUMN "spotify_playlist_url";

-- DropTable
DROP TABLE "spotify_accounts";
