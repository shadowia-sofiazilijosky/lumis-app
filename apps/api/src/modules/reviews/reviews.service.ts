import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Prisma, Review } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpsertReviewDto } from './dto/upsert-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(ownerId: string, bookId: string): Promise<Review | null> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    return this.prisma.review.findUnique({
      where: { userId_bookId: { userId: ownerId, bookId } },
    });
  }

  async upsert(
    ownerId: string,
    bookId: string,
    dto: UpsertReviewDto,
  ): Promise<Review> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    const bodyRichText = dto.bodyRichText as Prisma.InputJsonValue | undefined;
    const startedAt = dto.startedAt ? new Date(dto.startedAt) : undefined;
    const finishedAt = dto.finishedAt ? new Date(dto.finishedAt) : undefined;

    return this.prisma.review.upsert({
      where: { userId_bookId: { userId: ownerId, bookId } },
      create: {
        userId: ownerId,
        bookId,
        status: dto.status,
        rating: dto.rating,
        spicyRating: dto.spicyRating,
        romanceRating: dto.romanceRating,
        plotRating: dto.plotRating,
        sadnessRating: dto.sadnessRating,
        humorRating: dto.humorRating,
        mysteryRating: dto.mysteryRating,
        genre: dto.genre,
        favoriteCharacter: dto.favoriteCharacter,
        leastFavoriteCharacter: dto.leastFavoriteCharacter,
        favoriteQuote: dto.favoriteQuote,
        cried: dto.cried,
        recommend: dto.recommend,
        bookNumberOfYear: dto.bookNumberOfYear,
        mood: dto.mood,
        notes: dto.notes,
        bodyRichText,
        startedAt,
        finishedAt,
      },
      update: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.spicyRating !== undefined && { spicyRating: dto.spicyRating }),
        ...(dto.romanceRating !== undefined && {
          romanceRating: dto.romanceRating,
        }),
        ...(dto.plotRating !== undefined && { plotRating: dto.plotRating }),
        ...(dto.sadnessRating !== undefined && {
          sadnessRating: dto.sadnessRating,
        }),
        ...(dto.humorRating !== undefined && { humorRating: dto.humorRating }),
        ...(dto.mysteryRating !== undefined && {
          mysteryRating: dto.mysteryRating,
        }),
        ...(dto.genre !== undefined && { genre: dto.genre }),
        ...(dto.favoriteCharacter !== undefined && {
          favoriteCharacter: dto.favoriteCharacter,
        }),
        ...(dto.leastFavoriteCharacter !== undefined && {
          leastFavoriteCharacter: dto.leastFavoriteCharacter,
        }),
        ...(dto.favoriteQuote !== undefined && {
          favoriteQuote: dto.favoriteQuote,
        }),
        ...(dto.cried !== undefined && { cried: dto.cried }),
        ...(dto.recommend !== undefined && { recommend: dto.recommend }),
        ...(dto.bookNumberOfYear !== undefined && {
          bookNumberOfYear: dto.bookNumberOfYear,
        }),
        ...(dto.mood !== undefined && { mood: dto.mood }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.bodyRichText !== undefined && { bodyRichText }),
        ...(dto.startedAt !== undefined && { startedAt }),
        ...(dto.finishedAt !== undefined && { finishedAt }),
      },
    });
  }

  private async getOwnedBookOrThrow(
    ownerId: string,
    bookId: string,
  ): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });

    if (!book || book.ownerId !== ownerId) {
      throw new NotFoundException('Libro no encontrado.');
    }

    return book;
  }
}
