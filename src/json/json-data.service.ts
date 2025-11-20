import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MessageEventDataValues } from '../types/drilling-data.types';

@Injectable()
export class JsonDataService implements OnModuleInit {
  private readonly logger = new Logger(JsonDataService.name);
  private drillingData: MessageEventDataValues[] = [];
  private currentIndex = 0;
  private currentFileName: string = 'default';

  async onModuleInit() {
    // Загружаем начальные мок данные в вашем формате
    this.drillingData = this.generateMockData();
    this.logger.log('JsonDataService инициализирован с мок данными');
  }

  /**
   * Обрабатывает загруженный JSON файл
   */
  async processUploadedJson(file: Express.Multer.File): Promise<{ success: boolean; message: string; dataInfo?: any }> {
    try {
      this.logger.log(`Обработка загруженного файла: ${file.originalname}`);

      // Проверяем тип файла
      if (!file.originalname.toLowerCase().endsWith('.json')) {
        return {
          success: false,
          message: 'Файл должен быть в формате JSON'
        };
      }

      // Парсим JSON
      const fileContent = file.buffer.toString('utf8');
      const parsedData = JSON.parse(fileContent);

      // Валидируем и преобразуем данные
      this.drillingData = this.validateAndTransformData(parsedData);
      this.currentIndex = 0;
      this.currentFileName = file.originalname;

      this.logger.log(`Успешно обработан файл ${file.originalname}. Записей: ${this.drillingData.length}`);

      return {
        success: true,
        message: `Файл ${file.originalname} успешно обработан`,
        dataInfo: {
          fileName: this.currentFileName,
          totalRows: this.drillingData.length,
          columns: this.drillingData.length > 0 ? Object.keys(this.drillingData[0]) : []
        }
      };

    } catch (error) {
      this.logger.error(`Ошибка обработки файла ${file.originalname}:`, error);
      
      return {
        success: false,
        message: `Ошибка обработки файла: ${error.message}`
      };
    }
  }

  /**
   * Обрабатывает JSON данные напрямую (без файла)
   */
  async processJsonData(jsonData: any, sourceName: string = 'direct-upload'): Promise<{ success: boolean; message: string; dataInfo?: any }> {
    try {
      this.logger.log(`Обработка JSON данных из: ${sourceName}`);

      // Валидируем и преобразуем данные
      this.drillingData = this.validateAndTransformData(jsonData);
      this.currentIndex = 0;
      this.currentFileName = sourceName;

      this.logger.log(`Успешно обработаны данные из ${sourceName}. Записей: ${this.drillingData.length}`);

      return {
        success: true,
        message: `Данные из ${sourceName} успешно обработаны`,
        dataInfo: {
          fileName: this.currentFileName,
          totalRows: this.drillingData.length,
          columns: this.drillingData.length > 0 ? Object.keys(this.drillingData[0]) : []
        }
      };

    } catch (error) {
      this.logger.error(`Ошибка обработки данных из ${sourceName}:`, error);
      
      return {
        success: false,
        message: `Ошибка обработки данных: ${error.message}`
      };
    }
  }

  private validateAndTransformData(data: any): MessageEventDataValues[] {
    if (!Array.isArray(data)) {
      throw new Error('Данные должны быть массивом объектов');
    }

    if (data.length === 0) {
      throw new Error('Массив данных не должен быть пустым');
    }

    return data.map((item, index) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`Элемент с индексом ${index} должен быть объектом`);
      }

      const validatedItem: MessageEventDataValues = {};

      for (const [key, value] of Object.entries(item)) {
        // Пропускаем пустые ключи
        if (!key || key.trim() === '') continue;

        // Обрабатываем null значения - преобразуем в 0
        if (value === null) {
          validatedItem[key] = 0;
          continue;
        }

        if (typeof value === 'number') {
          validatedItem[key] = value;
        } else if (typeof value === 'string') {
          // Пытаемся преобразовать строку в число
          const numValue = parseFloat(value);
          validatedItem[key] = isNaN(numValue) ? 0 : numValue;
        } else if (typeof value === 'boolean') {
          validatedItem[key] = value ? 1 : 0;
        } else {
          // Для других типов (object, array и т.д.) устанавливаем 0
          validatedItem[key] = 0;
        }
      }

      if (Object.keys(validatedItem).length === 0) {
        throw new Error(`Элемент с индексом ${index} не содержит валидных числовых данных`);
      }

      return validatedItem;
    });
  }

  private generateMockData(): MessageEventDataValues[] {
    this.logger.log('Генерация мок данных в формате DC_out...');
    
    const mockData: MessageEventDataValues[] = [];
    for (let i = 0; i < 20; i++) {
      mockData.push({
        "DC_out_100ms[140].10": 0.5 + i * 0.1,
        "DC_out_100ms[140].13": 1.2 + i * 0.05,
        "DC_out_100ms[140].14": 10 + i * 2,
        "DC_out_100ms[140].8": 95 - i * 0.5,
        "DC_out_100ms[140].9": 60 + i * 1,
        "DC_out_100ms[141].10": 120 + i * 3,
        "DC_out_100ms[141].13": 15 + i * 0.8,
        "DC_out_100ms[141].8": i % 3 === 0 ? 0 : 25 + i, // имитация null через 0
        "DC_out_100ms[141].9": 20 + i * 1.5,
        "DC_out_100ms[144]": i % 2,
        "DC_out_100ms[146]": 1,
        "DC_out_100ms[148]": 15 + i * 0.7,
        "DC_out_100ms[164]": 25 + i * 1.2,
        "DC_out_100ms[165]": 8 + i * 0.5
      });
    }
    return mockData;
  }

  // Основные методы доступа к данным
  getNextDrillingData(): MessageEventDataValues | null {
    if (this.drillingData.length === 0) {
      return null;
    }

    const currentRow = this.drillingData[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.drillingData.length;
    return currentRow;
  }

  async refreshData(): Promise<void> {
    this.currentIndex = 0;
    this.logger.log('Индекс данных сброшен');
  }

  getDataInfo(): { 
    totalRows: number; 
    currentIndex: number;
    fileName: string;
    columns: string[];
    sampleRow?: MessageEventDataValues;
  } {
    const sampleRow = this.drillingData.length > 0 ? this.drillingData[0] : undefined;
    
    return {
      totalRows: this.drillingData.length,
      currentIndex: this.currentIndex,
      fileName: this.currentFileName,
      columns: this.drillingData.length > 0 ? Object.keys(this.drillingData[0]) : [],
      sampleRow: sampleRow
    };
  }

  // Получить все данные (для отладки)
  getAllData(): MessageEventDataValues[] {
    return [...this.drillingData];
  }

  // Получить конкретную запись по индексу
  getDataByIndex(index: number): MessageEventDataValues | null {
    if (index < 0 || index >= this.drillingData.length) {
      return null;
    }
    return this.drillingData[index];
  }
}