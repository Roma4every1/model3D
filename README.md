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
+ `/src` — **папка с исходным кодом**
  + `/@types` — папка с декларацией типов
  + `/api` — взаимодействие с сервером
  + `/components` — React компоненты
    + `/editors` — редакторы параметров
    + `/common` — общие компоненты
    + `/dicts` — "словари" компонентов
    + `/forms` — компоненты формы
  + `/dataManagers` — объекты для работы с данными
  + `/locales` — локализации
  + `/static` — статические файлы
    + `/media` — изображение и т.п.
    + `/libs` — файлы для отрисовки карт
  + `/store` — Redux (состояние приложение)
+ `.editorconfig` — настройки оформления кода
+ `.gitignore` — список файлов, неотслеживаемых Git
+ `kendo-ui-license.txt` — лицензия для библиотек Telerik
+ `package.json` — конфигурация проекта
+ `README.md` — информация о проекте
+ `tsconfig.json` — конфигурация TypeScript
