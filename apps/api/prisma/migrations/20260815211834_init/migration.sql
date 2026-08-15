-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ReaderTheme" AS ENUM ('LIGHT', 'DARK', 'SEPIA');

-- CreateEnum
CREATE TYPE "BookFormat" AS ENUM ('PDF', 'EPUB', 'MOBI', 'CBR', 'CBZ', 'TXT');

-- CreateEnum
CREATE TYPE "ShelfArrangement" AS ENUM ('SPINE', 'COVER');

-- CreateEnum
CREATE TYPE "ReadingStatus" AS ENUM ('TBR', 'READING', 'PAUSED', 'FINISHED', 'REREAD', 'ABANDONED');

-- CreateEnum
CREATE TYPE "HighlightColor" AS ENUM ('YELLOW', 'PINK', 'GREEN', 'BLUE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "theme_preference" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "format" "BookFormat" NOT NULL,
    "original_file_url" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "normalized_content_url" TEXT,
    "page_count" INTEGER,
    "file_size_bytes" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelves" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genre" TEXT,
    "arrangement" "ShelfArrangement" NOT NULL DEFAULT 'SPINE',
    "background_color" TEXT,
    "background_image_url" TEXT,
    "decorations" JSONB NOT NULL DEFAULT '[]',
    "spotify_playlist_id" TEXT,
    "spotify_playlist_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_shelves" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "shelf_id" TEXT NOT NULL,
    "position" JSONB,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "status" "ReadingStatus" NOT NULL DEFAULT 'TBR',
    "rating" INTEGER,
    "spicy_rating" INTEGER,
    "romance_rating" INTEGER,
    "body_rich_text" JSONB,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "current_page" INTEGER NOT NULL DEFAULT 0,
    "current_locator" JSONB,
    "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reader_theme" "ReaderTheme" NOT NULL DEFAULT 'LIGHT',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "color" "HighlightColor" NOT NULL,
    "page_index" INTEGER NOT NULL,
    "start_offset" INTEGER NOT NULL,
    "end_offset" INTEGER NOT NULL,
    "selected_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "highlight_id" TEXT,
    "page_index" INTEGER NOT NULL,
    "offset" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "color_tag" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spotify_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "spotify_user_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spotify_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "books_owner_id_idx" ON "books"("owner_id");

-- CreateIndex
CREATE INDEX "shelves_owner_id_idx" ON "shelves"("owner_id");

-- CreateIndex
CREATE INDEX "book_shelves_shelf_id_idx" ON "book_shelves"("shelf_id");

-- CreateIndex
CREATE INDEX "book_shelves_book_id_idx" ON "book_shelves"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "book_shelves_book_id_shelf_id_key" ON "book_shelves"("book_id", "shelf_id");

-- CreateIndex
CREATE INDEX "reviews_book_id_idx" ON "reviews"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_book_id_key" ON "reviews"("user_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progress_user_id_book_id_key" ON "reading_progress"("user_id", "book_id");

-- CreateIndex
CREATE INDEX "highlights_book_id_user_id_idx" ON "highlights"("book_id", "user_id");

-- CreateIndex
CREATE INDEX "notes_book_id_user_id_idx" ON "notes"("book_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "spotify_accounts_user_id_key" ON "spotify_accounts"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shelves" ADD CONSTRAINT "shelves_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_shelves" ADD CONSTRAINT "book_shelves_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_shelves" ADD CONSTRAINT "book_shelves_shelf_id_fkey" FOREIGN KEY ("shelf_id") REFERENCES "shelves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_highlight_id_fkey" FOREIGN KEY ("highlight_id") REFERENCES "highlights"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotify_accounts" ADD CONSTRAINT "spotify_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
