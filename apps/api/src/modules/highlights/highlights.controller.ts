import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Highlight } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';
import { HighlightsService } from './highlights.service';

@Controller('books/:id/highlights')
export class HighlightsController {
  constructor(private readonly highlightsService: HighlightsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Highlight[]> {
    return this.highlightsService.findAllForBook(user.userId, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateHighlightDto,
  ): Promise<Highlight> {
    return this.highlightsService.create(user.userId, id, dto);
  }

  @Patch(':highlightId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('highlightId') highlightId: string,
    @Body() dto: UpdateHighlightDto,
  ): Promise<Highlight> {
    return this.highlightsService.update(user.userId, id, highlightId, dto);
  }

  @Delete(':highlightId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('highlightId') highlightId: string,
  ): Promise<void> {
    await this.highlightsService.remove(user.userId, id, highlightId);
  }
}
