import { saveAs } from '@progress/kendo-file-saver';
import { useTranslation } from 'react-i18next';


interface UnsupportedFileProps {
  /** Название файла. */
  name: string;
  /** Содержимое файла. */
  data: Blob;
}


/** Заглушка для неподдерживаемого расширения файла. */
export const UnsupportedFile = ({name, data}: UnsupportedFileProps) => {
  const { t } = useTranslation();
  const onClick = () => saveAs(data, name);

  return (
    <div className={'wm-text-info file-view-unsupported'}>
      <div>
        <span>{t('file-view.unsupported-1')}</span>
        <strong>{name}</strong>
        <span>{t('file-view.unsupported-2')}</span>
      </div>
      <button onClick={onClick}>{t('file-view.download')}</button>
    </div>
  );
};
