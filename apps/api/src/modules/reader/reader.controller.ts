import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  StreamableFile,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ReaderService } from './reader.service';

interface TextPageResponse {
  pageNumber: number;
  totalPages: number;
  text: string;
}

@Controller('books/:id/pages')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @Get(':pageNumber')
  async getPage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('pageNumber', ParseIntPipe) pageNumber: number,
  ): Promise<StreamableFile | TextPageResponse> {
    const result = await this.readerService.getPage(
      user.userId,
      id,
      pageNumber,
    );

    if (result.kind === 'image') {
      return new StreamableFile(result.buffer, { type: result.contentType });
    }

    return {
      pageNumber: result.pageNumber,
      totalPages: result.totalPages,
      text: result.text,
    };
  }
}
