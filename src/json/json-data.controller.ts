import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Logger, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JsonDataService } from './json-data.service';

@Controller('data')
export class JsonDataController {
  private readonly logger = new Logger(JsonDataController.name);

  constructor(private readonly jsonDataService: JsonDataService) {}

  /**
   * Загрузка JSON файла
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJsonFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    this.logger.log(`Получен файл: ${file.originalname}, размер: ${file.size} байт`);
    
    const result = await this.jsonDataService.processUploadedJson(file);
    
    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return result;
  }

  /**
   * Прямая загрузка JSON данных через тело запроса
   */
  @Post('upload-json')
  async uploadJsonData(@Body() body: any) {
    this.logger.log('Получены JSON данные через тело запроса');

    const result = await this.jsonDataService.processJsonData(body, 'direct-upload');
    
    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return result;
  }

  /**
   * Получить информацию о текущих данных
   */
  @Get('info')
  getDataInfo() {
    return this.jsonDataService.getDataInfo();
  }

  /**
   * Получить все данные (для отладки)
   */
  @Get('all')
  getAllData() {
    return {
      data: this.jsonDataService.getAllData(),
      info: this.jsonDataService.getDataInfo()
    };
  }

  /**
   * Сбросить индекс данных
   */
  @Post('reset')
  async resetData() {
    await this.jsonDataService.refreshData();
    return { 
      message: 'Индекс данных сброшен',
      info: this.jsonDataService.getDataInfo()
    };
  }

  /**
   * Получить пример структуры JSON файла в правильном формате
   */
  @Get('example')
  getExampleStructure() {
    return {
      description: 'Пример структуры JSON файла для загрузки (формат DC_out)',
      example: [
        {
          "DC_out_100ms[140].10": 0.5,
          "DC_out_100ms[140].13": 1.2,
          "DC_out_100ms[140].14": 10,
          "DC_out_100ms[140].8": 95,
          "DC_out_100ms[140].9": 60,
          "DC_out_100ms[141].10": 120,
          "DC_out_100ms[141].13": 15,
          "DC_out_100ms[141].8": null,
          "DC_out_100ms[141].9": 20,
          "DC_out_100ms[144]": 1,
          "DC_out_100ms[146]": 1,
          "DC_out_100ms[148]": 15,
          "DC_out_100ms[164]": 25,
          "DC_out_100ms[165]": 8
        },
        {
          "DC_out_100ms[140].10": 0.8,
          "DC_out_100ms[140].13": 1.5,
          "DC_out_100ms[140].14": 20,
          "DC_out_100ms[140].8": 90,
          "DC_out_100ms[140].9": 70,
          "DC_out_100ms[141].10": 125,
          "DC_out_100ms[141].13": 18,
          "DC_out_100ms[141].8": null,
          "DC_out_100ms[141].9": 25,
          "DC_out_100ms[144]": 1,
          "DC_out_100ms[146]": 1,
          "DC_out_100ms[148]": 20,
          "DC_out_100ms[164]": 30,
          "DC_out_100ms[165]": 12
        }
      ],
      requirements: [
        "Файл должен быть в формате JSON",
        "При формировании файла необходимо использовать лишь пример из блока 'example' со структурой [ {tags...},{tags...} ]",
        "Данные должны быть массивом объектов",
        "Ключи могут содержать точки и квадратные скобки (например: DC_out_100ms[140].10)",
        "Значения могут быть числами, строками-числами или null",
        "Null значения будут преобразованы в 0",
        "Минимум 1 запись в массиве"
      ]
    };
  }
}