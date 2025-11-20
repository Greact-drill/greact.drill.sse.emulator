import { Module } from '@nestjs/common';
import { SseController } from './sse/sse.controller';
import { SseService } from './sse/sse.service';
import { JsonDataService } from './json/json-data.service';
import { JsonDataController } from './json/json-data.controller';

@Module({
  imports: [],
  controllers: [SseController, JsonDataController],
  providers: [SseService, JsonDataService],
})
export class AppModule {}