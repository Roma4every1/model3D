import { type FC, createElement, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { saveFile } from 'shared/lib';
import { useChannelData } from 'entities/channel';
import { useFileViewState } from '../store/file-view.store';
import { updateFileViewModel } from '../store/file-view.thunks';
import { supportedExtensions } from '../lib/constants';

import './file-view.scss';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { TextInfo } from 'shared/ui';
import { IFrameView, TextView } from './common-views';
import { ImageView } from './image-view';
import { ExcelView } from './excel/excel-view';
import { CsvView } from './csv-view';
import { MsWordView } from './ms-word-view';


const fileViewDict: Record<string, FC<FileViewModel>> = {
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
  const channelData = useChannelData(channels[0]?.id);

  useEffect(() => {
    updateFileViewModel(id, channelData).then();
  }, [channelData, id]);

  if (!model) return <TextInfo text={'file-view.no-file'}/>;
  if (model.loading) return <TextInfo text={'base.loading'}/>;
  if (!model.fileType) return <TextInfo text={'file-view.no-file-type-error'}/>;

  const { fileName, fileType, data } = model;
  const download = () => saveFile(fileName, data);

  if (!supportedExtensions.has(fileType)) {
    return <UnsupportedFile name={fileName} download={download}/>;
  }
  return (
    <>
      {createElement(fileViewDict[fileType], model)}
      <Button
        type={'text'} style={{position: 'absolute', top: 1, right: 1}}
        icon={<DownloadOutlined/>} onClick={download}
      />
    </>
  );
};

/** Заглушка для неподдерживаемого расширения файла. */
const UnsupportedFile = ({name, download}: {name: string, download: () => void}) => {
  const { t } = useTranslation();

  return (
    <div className={'wm-text-info file-view-unsupported'}>
      <div>
        <span>{t('file-view.unsupported-1')}</span>
        <strong>{name}</strong>
        <span>{t('file-view.unsupported-2')}</span>
      </div>
      <button onClick={download}>{t('file-view.download')}</button>
    </div>
  );
};
