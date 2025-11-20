import { Controller, Sse, Get, Res, Logger, Query, Post, Header } from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';
import { randomUUID } from 'crypto';
import { MessageEvent } from '../types/drilling-data.types';

@Controller('sse')
export class SseController {
  private readonly logger = new Logger(SseController.name);

  constructor(private readonly sseService: SseService) { }

  @Sse('stream')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  streamDrillingData(
    @Res() response: Response,
    @Query('clientId') clientId?: string,
  ): Observable<MessageEvent> {
    const id = clientId || randomUUID();

    this.logger.log(`Новое подключение к SSE потоку: ${id}`);

    response.on('close', () => {
      this.logger.log(`Клиент ${id} отключился`);
      this.sseService.removeClient(id);
    });

    response.on('error', (error) => {
      this.logger.error(`Ошибка соединения с клиентом ${id}:`, error);
      this.sseService.removeClient(id);
    });

    return this.sseService.addClient(id);
  }

  @Get('status')
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  getStatus() {
    return this.sseService.getStatus();
  }

  @Post('refresh')
  async refreshData() {
    await this.sseService.refreshNotionData();
    return { message: 'Данные успешно обновлены' };
  }
}