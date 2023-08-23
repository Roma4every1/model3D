import { saveAs } from '@progress/kendo-file-saver';
import { useTranslation } from 'react-i18next';


interface UnsupportedFileProps {
  /** Модель просматриваемого файла. */
  model: FileViewModel;
}


/** Заглушка для неподдерживаемого расширения файла. */
export const UnsupportedFile = ({model}: UnsupportedFileProps) => {
  const { t } = useTranslation();
  const onClick = () => saveAs(model.data, model.fileName);

  return (
    <div className={'wm-text-info file-view-unsupported'}>
      <div>
        <span>{t('file-view.unsupported-1')}</span>
        <strong>{model.fileName}</strong>
        <span>{t('file-view.unsupported-2')}</span>
      </div>
      <button onClick={onClick}>{t('file-view.download')}</button>
    </div>
  );
};
