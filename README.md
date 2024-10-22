# JS Well Manager Web

## Структура проекта

Корень проекта имеет следующие каталоги:
+ `public`: ассеты, не использующиеся во время компиляции
+ `scripts`: установочные скрипты, плагины сборки
+ `src`: исходный код

Конфиги проекта:
+ `package.json` и `package-lock.json`: конфиг Node.js и npm
+ `tsconfig.json` и `tsconfig.node.json`: конфиг TypeScript
+ `vite.config.ts`: конфиг сборщика (используется Vite)
+ `eslint.config.js`: конфиг ESLint
+ `kendo-ui-license.txt`: лицензионный ключ для KendoUI

Конфиги сторонних программ:
+ `.editorconfig`: настройки редактора или IDE
+ `.gitattributes`: настройки Git
+ `.gitignore`: исключения Git

### Структура исходного кода

За основу взят архитектурный паттерн [FSD](https://feature-sliced.design):
5 слоёв логики приложения от наибольшей ответственности и к наименьшей.

```text
src/
├── assets/      # каталог с ассетами
├── app/         # слой приложения
├── widgets/     # слой виджетов
├── features/    # слой фичей
├── entities/    # слой сущностей
├── shared/      # разделяемые/переиспользуемые функции
└── index.tsx    # точка входа
```
