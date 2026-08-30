import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { NotesService, type NotesOverview } from './notes.service';

/** Separate from NotesController (`books/:id/notes`) -- this one aggregates
 * across every book, for the top-level Notas list page. */
@Controller('notes')
export class NotesOverviewController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findOverview(@CurrentUser() user: AuthenticatedUser): Promise<NotesOverview> {
    return this.notesService.findOverviewForOwner(user.userId);
  }
}
