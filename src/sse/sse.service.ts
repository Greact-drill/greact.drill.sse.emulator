import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { MessageEvent, MessageEventData } from '../types/drilling-data.types';
import { NotionService } from '../notion/notion.service';
import { ENV } from '../config/env.config';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private clients = new Map<string, Subject<MessageEvent>>();
  private readonly intervalMs: number;

  constructor(private readonly notionService: NotionService) {
    this.intervalMs = parseInt(ENV.SSE_INTERVAL);
    this.startBroadcast();
  }

  private startBroadcast(): void {
    setInterval(() => {
      const drillingDataValues = this.notionService.getNextDrillingData();
      if (drillingDataValues) {
        const drillingData: MessageEventData = {
          version: '1.0.0',
          timestamp: Date.now(),
          currentIndex: this.notionService.getDataInfo().currentIndex,
          values: drillingDataValues
        }
        this.broadcastEvent(drillingData);
      }
    }, this.intervalMs);
  }

  addClient(clientId: string): Observable<MessageEvent> {
    const stream = new Subject<MessageEvent>();
    this.clients.set(clientId, stream);
    this.logger.log(`Клиент подключен: ${clientId}. Всего клиентов: ${this.clients.size}`);
    return stream.asObservable();
  }

  removeClient(clientId: string): void {
    const stream = this.clients.get(clientId);
    if (stream) {
      stream.complete();
      this.clients.delete(clientId);
      this.logger.log(`Клиент отключен: ${clientId}. Осталось клиентов: ${this.clients.size}`);
    }
  }

  // Отправка события всем подключенным клиентам
  broadcastEvent(eventData: MessageEventData): void {
    const messageEvent: MessageEvent = {
      data: eventData,
    };

    this.clients.forEach((stream) => stream.next(messageEvent));
  }

  getStatus() {
    return {
      clientsCount: this.clients.size,
      intervalMs: this.intervalMs,
      clients: Array.from(this.clients.keys())
    };
  }

  async refreshNotionData(): Promise<void> {
    await this.notionService.refreshData();
    this.logger.log('Данные Notion обновлены');
  }
}
