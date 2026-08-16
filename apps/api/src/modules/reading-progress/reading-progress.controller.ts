import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ReadingProgress } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { ReadingProgressService } from './reading-progress.service';

@Controller('books/:id/progress')
export class ReadingProgressController {
  constructor(
    private readonly readingProgressService: ReadingProgressService,
  ) {}

  @Get()
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ReadingProgress | null> {
    return this.readingProgressService.get(user.userId, id);
  }

  @Put()
  upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateReadingProgressDto,
  ): Promise<ReadingProgress> {
    return this.readingProgressService.upsert(user.userId, id, dto);
  }
}
