import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { Review } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpsertReviewDto } from './dto/upsert-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('books/:id/review')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Review | null> {
    return this.reviewsService.get(user.userId, id);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpsertReviewDto,
  ): Promise<Review> {
    return this.reviewsService.upsert(user.userId, id, dto);
  }
}
