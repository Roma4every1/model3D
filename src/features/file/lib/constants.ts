import { IConfig } from '@cyntler/react-doc-viewer';


/** Конфиг компонента просмотра файлов. */
export const docViewerConfig: IConfig = {
  header: {disableHeader: true},
};

/** Словарь типов MIME для расширений файлов. */
export const mimeTypeDict = {
  'txt': 'text/plain',
  'png': 'image/png',
  'bmp': 'image/bmp',
  'jpg': 'image/jpg',
  'jpeg': 'image/jpeg',
  'csv': 'text/csv',
  'html': 'text/html',
  'pdf': 'application/pdf',
};

/** Список поддерживаемых расширений для просмотра. */
export const supportedExtensions = new Set(Object.keys(mimeTypeDict));
