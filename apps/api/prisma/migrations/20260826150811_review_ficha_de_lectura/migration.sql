-- CreateEnum
CREATE TYPE "RecommendLevel" AS ENUM ('YES', 'MAYBE', 'NO');

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "book_number_of_year" INTEGER,
ADD COLUMN     "cried" BOOLEAN,
ADD COLUMN     "favorite_character" TEXT,
ADD COLUMN     "favorite_quote" TEXT,
ADD COLUMN     "genre" TEXT,
ADD COLUMN     "humor_rating" INTEGER,
ADD COLUMN     "least_favorite_character" TEXT,
ADD COLUMN     "mood" TEXT,
ADD COLUMN     "mystery_rating" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "plot_rating" INTEGER,
ADD COLUMN     "recommend" "RecommendLevel",
ADD COLUMN     "sadness_rating" INTEGER;
