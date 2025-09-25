import { Module } from '@nestjs/common';
import { SseController } from './sse/sse.controller';
import { SseService } from './sse/sse.service';
import { NotionService } from './notion/notion.service';

@Module({
  imports: [],
  controllers: [SseController],
  providers: [SseService, NotionService],
})
export class AppModule {}
