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
  Put,
} from '@nestjs/common';
import { Shelf } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AddBookToShelfDto } from './dto/add-book-to-shelf.dto';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { UpdateShelfLayoutDto } from './dto/update-shelf-layout.dto';
import { ShelvesService } from './shelves.service';
import type { ShelfListItem, ShelfWithBooks } from './shelves.service';

@Controller('shelves')
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateShelfDto,
  ): Promise<Shelf> {
    return this.shelvesService.create(user.userId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<ShelfListItem[]> {
    return this.shelvesService.findAllForOwner(user.userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ShelfWithBooks> {
    return this.shelvesService.findOneForOwner(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateShelfDto,
  ): Promise<Shelf> {
    return this.shelvesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.shelvesService.remove(user.userId, id);
  }

  @Post(':id/books')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addBook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AddBookToShelfDto,
  ): Promise<void> {
    await this.shelvesService.addBook(user.userId, id, dto);
  }

  @Delete(':id/books/:bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('bookId') bookId: string,
  ): Promise<void> {
    await this.shelvesService.removeBook(user.userId, id, bookId);
  }

  @Put(':id/layout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLayout(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateShelfLayoutDto,
  ): Promise<void> {
    await this.shelvesService.updateLayout(user.userId, id, dto);
  }
}
