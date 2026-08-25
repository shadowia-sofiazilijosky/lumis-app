-- CreateTable
CREATE TABLE "strokes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "page_index" INTEGER NOT NULL,
    "points" JSONB NOT NULL,
    "color" TEXT NOT NULL,
    "brush" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strokes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "strokes_book_id_user_id_idx" ON "strokes"("book_id", "user_id");

-- AddForeignKey
ALTER TABLE "strokes" ADD CONSTRAINT "strokes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strokes" ADD CONSTRAINT "strokes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
