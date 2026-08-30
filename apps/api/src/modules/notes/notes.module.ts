import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesOverviewController } from './notes-overview.controller';
import { NotesService } from './notes.service';

@Module({
  controllers: [NotesController, NotesOverviewController],
  providers: [NotesService],
})
export class NotesModule {}
