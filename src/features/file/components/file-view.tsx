import { FunctionComponent, createElement, useEffect } from 'react';
import { useChannel } from 'entities/channel';
import { useFileViewState } from '../store/file-view.store';
import { updateFileViewModel } from '../store/file-view.thunks';

import './file-view.scss';
import { TextInfo } from 'shared/ui';
import { UnsupportedFile } from './unsupported-file';
import { IFrameView, TextView } from './common-views';
import { ImageView } from './image-view';
import { ExcelView } from './excel/excel-view';
import { CsvView } from './csv-view';
import { MsWordView } from './ms-word-view';
import { supportedExtensions } from '../lib/constants';


const fileViewDict: Record<string, FunctionComponent<FileViewModel>> = {
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

/** Форма просмотра файла. */
export const FileView = ({id, channels}: SessionClient) => {
  const { model } = useFileViewState(id);
  const channel = useChannel(channels[0]?.name);
  const data = channel?.data;

  useEffect(() => {
    updateFileViewModel(id, data).then();
  }, [data, id]);

  if (!model) {
    return <TextInfo text={'file-view.no-file'}/>;
  }
  if (model.loading) {
    return <TextInfo text={'base.loading'}/>;
  }
  if (!supportedExtensions.has(model.fileType)) {
    return <UnsupportedFile name={model.fileName} data={model.data}/>;
  }
  return createElement(fileViewDict[model.fileType], model);
};
