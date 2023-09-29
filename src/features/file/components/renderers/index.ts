import { FunctionComponent } from 'react';
import { ImageView } from './image.tsx';
import { TextView, IFrameView } from './common.tsx';
import { CsvView } from './csv.tsx';
import { ExcelView } from './excel/excel-view.tsx';
import { MsWordView } from './ms-word.tsx';


export const fileViewDict: Record<string, FunctionComponent<FileViewModel>> = {
  'txt': TextView,
  'svg': ImageView,
  'png': ImageView,
  'bmp': ImageView,
  'jpg': ImageView,
  'jpeg': ImageView,
  'html': IFrameView,
  'pdf': IFrameView,
  'xlsx': ExcelView,
  'csv': CsvView,
  'docx': MsWordView,
};
