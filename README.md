# Well Manager React

### Структура проекта

+ `/build` — **скомпилированный клиент WMR**
+ `/node_modules` — **файлы библиотек**
+ `/public` — **файлы для компиляции**
  + `/data3d` — данные для отображения 3D
  + `clientConfiguration.json` — конфиг
  + `favicon.ico` — инонка сайта
  + `index.html` — стартовый HTML
  + `manifest.json` — манифест
+ `/src` — **исходный код**
  + `/@types` — декларации типов TypeScript
  + `/api` — взаимодействие с сервером
  + `/components` — React компоненты
    + `/editors` — редакторы параметров
    + `/common` — общие компоненты
    + `/forms` — компоненты формы
    + `/right-tabs` — компоненты панелей справа
    + `/top-tabs` — компоненты панелей сверху
  + `/dataManagers` — объекты для работы с данными
  + `/dicts` — "словари"
  + `/layout` — утилиты для разметки
  + `/locales` — локализация
  + `/static` — статические файлы
    + `/media` — изображение и т.п.
    + `/libs` — файлы для отрисовки карт
  + `/store` — Redux (состояние приложение)
  + `/styles` — стили
  + `index.js` — точка входа
+ `.editorconfig` — настройки оформления кода
+ `.gitignore` — список файлов, неотслеживаемых Git
+ `kendo-ui-license.txt` — лицензия Telerik Kendo React
+ `package.json` — конфигурация проекта
+ `README.md` — информация о проекте
+ `tsconfig.json` — конфигурация TypeScript
