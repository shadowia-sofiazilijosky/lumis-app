import { Module } from '@nestjs/common';
import { StrokesController } from './strokes.controller';
import { StrokesService } from './strokes.service';

@Module({
  controllers: [StrokesController],
  providers: [StrokesService],
})
export class StrokesModule {}
