import {TXTRenderer} from "../components/renderers/txt/txt-renderer.tsx";
import {ImageRenderer} from "../components/renderers/image/image-renderer.tsx";
import {HTMLRenderer} from "../components/renderers/html/html-renderer.tsx";
import {PDFRenderer} from "../components/renderers/pdf/pdf-renderer.tsx";
import {ExcelRenderer} from "../components/renderers/excel/excel-renderer.tsx";

/** Словарь типов MIME для расширений файлов. */
export const mimeTypeDict = {
  'txt': 'text/plain',
  'png': 'image/png',
  'bmp': 'image/bmp',
  'jpg': 'image/jpg',
  'jpeg': 'image/jpeg',
  'html': 'text/html',
  'pdf': 'application/pdf',
  'svg': 'image/svg+xml',
  // 'csv': 'text/csv',
  // 'xls': 'application/vnd.ms-excel',
  // 'xlsx': 'application/vnd.ms-excel',
};

/** Список поддерживаемых расширений для просмотра. */
export const supportedExtensions = new Set(Object.keys(mimeTypeDict));

/** Константы задающие параметры приближения на файлах изображений */
export const minImageZoom = 1;
export const maxImageZoom = 3;
export const imageZoomStepSize = 0.1;
