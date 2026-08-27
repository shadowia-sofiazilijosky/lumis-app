/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar_url",
ADD COLUMN     "avatar_image_key" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "favorite_quote" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "reading_goal" INTEGER,
ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "reading_activity_log" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "is_night" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_activity_log_user_id_idx" ON "reading_activity_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reading_activity_log_user_id_date_key" ON "reading_activity_log"("user_id", "date");

-- AddForeignKey
ALTER TABLE "reading_activity_log" ADD CONSTRAINT "reading_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
