Современная интеграция Node.js с базами данных Notion осуществляется через официальный API и npm-пакет @notionhq/client, который поддерживает последние обновления 2025 года. Работа с базами включает создание, чтение, обновление и удаление данных с помощью REST API, а структуры и методы постоянно совершенствуются.[^1][^2][^3]

## Как подключиться к Notion API

- Создайте интеграцию на https://www.notion.com/my-integrations, получите токен.[^1]
- Подключите интеграцию к нужной базе данных через настройки доступа (Share > Connections).[^4]


## Быстрый старт: установка и настройка

```bash
npm install @notionhq/client
```

В проекте инициализируйте клиент:

```js
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
```

Токен храните в .env:

```
NOTION_TOKEN=ваш_секретный_token
NOTION_DATABASE_ID=ваш_database_id
```


## Примеры работы с базами данных

### Получение записей

```js
const databaseId = process.env.NOTION_DATABASE_ID;

async function getItems() {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}
```


### Добавление записи

```js
await notion.pages.create({
  parent: { database_id: databaseId },
  properties: {
    Name: { title: [{ text: { content: "Название" } }] },
    Email: { email: "mail@example.com" }
    // Добавьте остальные поля по вашей схеме
  }
});
```


### Обновление записи

```js
await notion.pages.update({
  page_id: pageId,
  properties: {
    Status: { checkbox: true },
    Date: { date: { start: "2025-09-01" } }
  }
});
```


## Важные обновления API (2025)

С сентября 2025 API работает через data sources. Для работы с ними используйте endpoints вида notion.dataSources.* и смотрите Upgrade Guide и Database Reference:[^5][^6][^2]

- https://developers.notion.com/docs/upgrade-guide-2025-09-03
- https://developers.notion.com/reference/database
[^6][^5]


## Документация и ресурсы

- Официальная документация и примеры: https://developers.notion.com/docs/getting-started[^7]
- GitHub репозиторий SDK: https://github.com/makenotion/notion-sdk-js[^3]
- Пример интеграции на Next.js:[^8]


## Минималистичный цикл работы

- Получите токен и database ID[^1][^8]
- Используйте @notionhq/client для CRUD-операций, опираясь на официальную документацию[^7][^3]
- Для современных схем — работайте с dataSources и актуализируйте код под новые версии API[^5][^6]

Эти шаги позволят быстро, безопасно и красиво интегрировать Notion базы данных в ваши Node.js проекты, пользуясь последними возможностями платформы.[^9][^5][^8]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20]</span>

<div style="text-align: center">⁂</div>

[^1]: https://developers.notion.com/docs/create-a-notion-integration

[^2]: https://github.com/makenotion/notion-sdk-js/releases

[^3]: https://github.com/makenotion/notion-sdk-js

[^4]: https://dev.to/andreiparfenov/search-and-replace-getting-started-with-the-notion-api-sdk-for-javascript-47j2

[^5]: https://developers.notion.com/docs/upgrade-guide-2025-09-03

[^6]: https://developers.notion.com/reference/database

[^7]: https://developers.notion.com/docs/getting-started

[^8]: https://www.linkedin.com/pulse/building-website-notion-integration-form-submission-content-chan-meng-rptac

[^9]: https://www.twilio.com/en-us/blog/developers/tutorials/building-blocks/manipulate-notion-database-using-node-js

[^10]: https://developers.notion.com/reference/database-create

[^11]: https://www.npmjs.com/package/notion-api-js

[^12]: https://developers.notion.com/reference/database-update

[^13]: https://developers.notion.com

[^14]: https://developers.notion.com/docs/authorization

[^15]: https://endgrate.com/blog/using-the-notion-api-to-get-records-(with-javascript-examples)

[^16]: https://js2brain.com/blog/how-to-use-the-notion-api/

[^17]: https://thomasjfrank.com/notion-api-crash-course/

[^18]: https://www.npmjs.com/package/notion-client

[^19]: https://developers.notion.com/reference/post-database-query

[^20]: https://pipedream.com/apps/notion/integrations/node

