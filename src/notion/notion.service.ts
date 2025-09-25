import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, PartialDataSourceObjectResponse } from '@notionhq/client';
import { MessageEventDataValues } from '../types/drilling-data.types';
import { ENV } from '../config/env.config';

@Injectable()
export class NotionService implements OnModuleInit {
  private readonly logger = new Logger(NotionService.name);
  private notion: Client;
  private readonly dataSourceId: string;
  private drillingData: MessageEventDataValues[] = [];
  private currentIndex = 0;

  constructor() {
    this.notion = new Client({
      auth: ENV.NOTION_API_KEY,
    });
    this.dataSourceId = ENV.NOTION_DATABASE_ID; // В новом API это data_source_id
  }

  async onModuleInit() {
    await this.loadDrillingData();
  }

  private async loadDrillingData(): Promise<void> {
    try {
      this.logger.log('Загрузка данных из Notion...');

      const response = await this.notion.dataSources.query({
        data_source_id: this.dataSourceId,
        sorts: [
          {
            property: 'Номер',
            direction: 'ascending',
          },
        ],
      });

      this.drillingData = response.results.map(
        (page: PartialDataSourceObjectResponse) => {
          const properties = page.properties;
          const row: MessageEventDataValues = {};

          // Динамически обрабатываем все числовые поля
          Object.keys(properties).forEach((key) => {
            if (properties[key]?.type === 'number') {
              row[key] = this.extractNumber(properties[key]);
            }
          });

          return row;
        },
      );

      this.logger.log(
        `Загружено ${this.drillingData.length} записей из Notion`,
      );
    } catch (error) {
      this.logger.error('Ошибка при загрузке данных из Notion:', error);
      throw error;
    }
  }

  private extractNumber(property: any): number {
    return property?.number ?? 0;
  }

  getNextDrillingData(): MessageEventDataValues | null {
    if (this.drillingData.length === 0) return null;

    const currentRow = this.drillingData[this.currentIndex];

    // Переходим к следующей записи (циклично)
    this.currentIndex = (this.currentIndex + 1) % this.drillingData.length;

    return currentRow;
  }

  async refreshData(): Promise<void> {
    await this.loadDrillingData();
    this.currentIndex = 0;
  }

  getDataInfo(): { totalRows: number; currentIndex: number } {
    return {
      totalRows: this.drillingData.length,
      currentIndex: this.currentIndex,
    };
  }
}
