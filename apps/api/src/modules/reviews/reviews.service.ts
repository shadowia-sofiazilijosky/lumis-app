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
