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
    // A field left out of the request body is `undefined` here, and Prisma
    // treats an `undefined` property in create/update data as "don't touch
    // this column" -- exactly what we want, since the client always sends
    // its *entire* current state (an explicit `null` for a field the user
    // just cleared) rather than a partial patch.
    const startedAt =
      dto.startedAt === null
        ? null
        : dto.startedAt
          ? new Date(dto.startedAt)
          : undefined;
    const finishedAt =
      dto.finishedAt === null
        ? null
        : dto.finishedAt
          ? new Date(dto.finishedAt)
          : undefined;

    const sharedFields = {
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
    };

    return this.prisma.review.upsert({
      where: { userId_bookId: { userId: ownerId, bookId } },
      create: { userId: ownerId, bookId, ...sharedFields },
      update: sharedFields,
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
