import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Stroke } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateStrokeDto } from './dto/create-stroke.dto';
import { StrokesService } from './strokes.service';

@Controller('books/:id/strokes')
export class StrokesController {
  constructor(private readonly strokesService: StrokesService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Stroke[]> {
    return this.strokesService.findAllForBook(user.userId, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateStrokeDto,
  ): Promise<Stroke> {
    return this.strokesService.create(user.userId, id, dto);
  }

  @Delete(':strokeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('strokeId') strokeId: string,
  ): Promise<void> {
    await this.strokesService.remove(user.userId, id, strokeId);
  }
}
