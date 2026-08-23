import {
  BadRequestException,
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
  Query,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'node:path';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BooksService } from './books.service';
import type { BookWithSignedUrls } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { ReorderBooksDto } from './dto/reorder-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';

// Kept in sync with MAX_UPLOAD_SIZE_MB in .env.example — read directly from
// process.env here since Multer's options are built once, at module-load
// time, before Nest's DI container (and ConfigService) exists yet.
const MAX_UPLOAD_SIZE_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB ?? 100) * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.epub',
  '.mobi',
  '.cbr',
  '.cbz',
  '.txt',
]);

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          callback(
            new UnsupportedMediaTypeException(
              `Extensión no soportada: ${ext || '(sin extensión)'}. Formatos: PDF, EPUB, MOBI, CBR, CBZ, TXT.`,
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateBookDto,
  ): Promise<BookWithSignedUrls> {
    if (!file) {
      throw new BadRequestException('Falta el archivo del libro.');
    }

    return this.booksService.upload(
      user.userId,
      { buffer: file.buffer, originalname: file.originalname },
      dto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<BookWithSignedUrls[]> {
    return this.booksService.findAllForOwner(
      user.userId,
      skip ? Number(skip) : undefined,
      take ? Number(take) : undefined,
    );
  }

  @Put('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderBooksDto,
  ): Promise<void> {
    await this.booksService.reorder(user.userId, dto.bookIds);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<BookWithSignedUrls> {
    return this.booksService.findOneForOwner(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
  ): Promise<BookWithSignedUrls> {
    return this.booksService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.booksService.remove(user.userId, id);
  }
}
