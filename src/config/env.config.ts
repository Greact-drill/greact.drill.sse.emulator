export interface EnvironmentVariables {
  NOTION_API_KEY: string;
  NOTION_DATABASE_ID: string; // В новом API это data_source_id
  SSE_INTERVAL: string;
  PORT: string;
}

export function validateEnvironment(): EnvironmentVariables {
  const requiredVars = [
    // 'NOTION_API_KEY',
    // 'NOTION_DATABASE_ID',
    'SSE_INTERVAL',
    'PORT',
  ] as const;

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(
        `Отсутствует обязательная переменная окружения: ${varName}`,
      );
    }
  }

  return {
    NOTION_API_KEY: process.env.NOTION_API_KEY!,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID!,
    SSE_INTERVAL: process.env.SSE_INTERVAL!,
    PORT: process.env.PORT!,
  };
}

export const ENV = validateEnvironment();
