-- CreateTable
CREATE TABLE "reading_activity_books" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_activity_books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_activity_books_book_id_idx" ON "reading_activity_books"("book_id");

-- CreateIndex
CREATE UNIQUE INDEX "reading_activity_books_activity_id_book_id_key" ON "reading_activity_books"("activity_id", "book_id");

-- AddForeignKey
ALTER TABLE "reading_activity_books" ADD CONSTRAINT "reading_activity_books_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "reading_activity_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_activity_books" ADD CONSTRAINT "reading_activity_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
