import { Subject } from 'rxjs';

export interface MessageEventDataValues {
  [tag: string]: number;
}

export interface MessageEventData {
  version: '1.0.0';
  timestamp: number;
  currentIndex: number;
  values: MessageEventDataValues;
}

// Интерфейс MessageEvent для SSE согласно спецификации NestJS
export interface MessageEvent {
  data: MessageEventData;
}
